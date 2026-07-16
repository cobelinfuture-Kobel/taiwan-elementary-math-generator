import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GLM_S07_ANSWER_STATES,
  GLM_S07_BOUNDARY_LAYOUT_IDS,
  GLM_S07_QUESTION_COUNT,
  GLM_S07_SHARD_COUNT,
  buildGLMS07ScenarioPlan,
  readGLMS07Contract,
} from "./glm-s07-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const inputArgument = process.argv.find((item) => item.startsWith("--input="));
const inputRoot = path.resolve(inputArgument?.slice("--input=".length) ?? "/tmp/glm-s07-shards");
const outputRoot = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s07-answer-key-boundary-stress",
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

function summarizeRows(rows) {
  return {
    scenarioCount: rows.length,
    generatedScenarioCount: rows.filter((scenario) => scenario.generationOk).length,
    renderedScenarioCount: rows.filter((scenario) => scenario.renderAttempted).length,
    acceptancePassCount: rows.filter((scenario) => scenario.acceptanceStatus === "PASS").length,
    documentClassificationCounts: countBy(rows, (scenario) => scenario.documentClassification),
    renderFindingCounts: countBy(
      rows.flatMap((scenario) => scenario.renderFindings ?? []),
      (code) => code,
    ),
    questionItemCount: rows.reduce((sum, scenario) => sum + Number(scenario.generatedQuestionCount ?? 0), 0),
    answerItemCount: rows.reduce((sum, scenario) => sum + Number(scenario.answerItemCount ?? 0), 0),
    totalPdfPageCount: rows.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfPageCount ?? 0), 0),
    totalPdfBytes: rows.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfBytes ?? 0), 0),
    nonPassScenarios: rows
      .filter((scenario) => scenario.acceptanceStatus !== "PASS")
      .map((scenario) => ({
        scenarioId: scenario.scenarioId,
        layoutId: scenario.layoutId,
        answerStateId: scenario.answerStateId,
        documentClassification: scenario.documentClassification,
        renderStatus: scenario.renderStatus,
        renderFindings: scenario.renderFindings ?? [],
        generationIssueCodes: scenario.generationIssueCodes ?? [],
      })),
  };
}

const contract = readGLMS07Contract();
const expectedPlan = buildGLMS07ScenarioPlan();
const manifestPaths = findManifests(inputRoot);
const shards = manifestPaths.map((manifestPath) => JSON.parse(readFileSync(manifestPath, "utf8")));
if (shards.length !== GLM_S07_SHARD_COUNT) {
  throw new Error(`GLM_S07_SHARD_MANIFEST_COUNT:${shards.length}:${GLM_S07_SHARD_COUNT}`);
}
const shardIndexes = shards.map((shard) => shard.shardIndex).sort((a, b) => a - b);
if (JSON.stringify(shardIndexes) !== JSON.stringify([0, 1, 2, 3, 4])) {
  throw new Error(`GLM_S07_SHARD_INDEX_SET_INVALID:${JSON.stringify(shardIndexes)}`);
}
const scenarios = shards
  .sort((left, right) => left.shardIndex - right.shardIndex)
  .flatMap((shard) => shard.scenarios);
const expectedScenarioCount = contract.scope.answerKeyBoundaryScenarioCount;
if (scenarios.length !== expectedScenarioCount) {
  throw new Error(`GLM_S07_SCENARIO_COUNT:${scenarios.length}:${expectedScenarioCount}`);
}
const uniqueScenarioIds = new Set(scenarios.map((scenario) => scenario.scenarioId));
if (uniqueScenarioIds.size !== scenarios.length) {
  throw new Error(`GLM_S07_DUPLICATE_SCENARIO_IDS:${scenarios.length - uniqueScenarioIds.size}`);
}
const expectedIds = new Set(expectedPlan.map((scenario) => scenario.scenarioId));
const missingIds = [...expectedIds].filter((scenarioId) => !uniqueScenarioIds.has(scenarioId));
const unexpectedIds = [...uniqueScenarioIds].filter((scenarioId) => !expectedIds.has(scenarioId));
if (missingIds.length > 0 || unexpectedIds.length > 0) {
  throw new Error(`GLM_S07_SCENARIO_SET_MISMATCH:${JSON.stringify({ missingIds, unexpectedIds })}`);
}

const documentClassificationCounts = countBy(scenarios, (scenario) => scenario.documentClassification);
const renderFindingCounts = {};
for (const scenario of scenarios) {
  for (const code of scenario.renderFindings ?? []) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const generatedScenarioCount = scenarios.filter((scenario) => scenario.generationOk).length;
const renderedScenarioCount = scenarios.filter((scenario) => scenario.renderAttempted).length;
const renderPassCount = scenarios.filter((scenario) => scenario.renderStatus === "PASS").length;
const acceptancePassCount = scenarios.filter((scenario) => scenario.acceptanceStatus === "PASS").length;
const questionItemCount = scenarios.reduce((sum, scenario) => sum + Number(scenario.generatedQuestionCount ?? 0), 0);
const answerItemCount = scenarios.reduce((sum, scenario) => sum + Number(scenario.answerItemCount ?? 0), 0);
const totalPdfPageCount = scenarios.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfPageCount ?? 0), 0);
const totalPdfBytes = scenarios.reduce((sum, scenario) => sum + Number(scenario?.pdf?.pdfBytes ?? 0), 0);

const sourceSummaries = contract.publicUnits.map((unit) => ({
  sourceId: unit.sourceId,
  unitCode: unit.unitCode,
  title: unit.title,
  ...summarizeRows(scenarios.filter((scenario) => scenario.sourceId === unit.sourceId)),
  rendererProfileIds: unique(
    scenarios.filter((scenario) => scenario.sourceId === unit.sourceId)
      .map((scenario) => scenario.rendererProfileId),
  ),
  documentSchemaNames: unique(
    scenarios.filter((scenario) => scenario.sourceId === unit.sourceId)
      .map((scenario) => scenario.documentSchemaName),
  ),
}));
const layoutSummaries = GLM_S07_BOUNDARY_LAYOUT_IDS.map((layoutId) => ({
  layoutId,
  ...summarizeRows(scenarios.filter((scenario) => scenario.layoutId === layoutId)),
}));
const answerStateSummaries = GLM_S07_ANSWER_STATES.map((answerState) => ({
  answerStateId: answerState.answerStateId,
  includeAnswerKey: answerState.includeAnswerKey,
  ...summarizeRows(scenarios.filter((scenario) => scenario.answerStateId === answerState.answerStateId)),
}));

const expectedQuestionItemCount = expectedScenarioCount * GLM_S07_QUESTION_COUNT;
const expectedAnswerItemCount = (
  contract.scope.publicUnitCount
  * GLM_S07_BOUNDARY_LAYOUT_IDS.length
  * GLM_S07_QUESTION_COUNT
);
const allPass = (
  generatedScenarioCount === expectedScenarioCount
  && renderedScenarioCount === expectedScenarioCount
  && renderPassCount === expectedScenarioCount
  && acceptancePassCount === expectedScenarioCount
  && documentClassificationCounts.PASS === expectedScenarioCount
  && Object.keys(renderFindingCounts).length === 0
  && questionItemCount === expectedQuestionItemCount
  && answerItemCount === expectedAnswerItemCount
  && sourceSummaries.every((summary) => summary.acceptancePassCount === 6)
  && layoutSummaries.every((summary) => summary.acceptancePassCount === 30)
  && answerStateSummaries.every((summary) => summary.acceptancePassCount === 45)
);

const manifest = {
  schemaVersion: "glm-s07-answer-key-boundary-acceptance-v1",
  task: "GLM-S07_AnswerKeyAndMaximumBoundaryStress",
  status: allPass ? "PASS_ACCEPTED" : "ACCEPTANCE_FAILED",
  globalStatus: allPass
    ? "ALL_90_ANSWER_KEY_BOUNDARY_HTML_PDF_PASS"
    : "ANSWER_KEY_BOUNDARY_GAPS_DETECTED",
  publicUnitCount: contract.scope.publicUnitCount,
  boundaryLayoutCountPerUnit: GLM_S07_BOUNDARY_LAYOUT_IDS.length,
  answerStateCountPerLayout: GLM_S07_ANSWER_STATES.length,
  scenarioCount: scenarios.length,
  shardCount: shards.length,
  generatedScenarioCount,
  renderedScenarioCount,
  renderPassCount,
  acceptancePassCount,
  acceptanceFailureCount: scenarios.length - acceptancePassCount,
  renderDefectScenarioCount: scenarios.length - renderPassCount,
  questionItemCount,
  expectedQuestionItemCount,
  answerItemCount,
  expectedAnswerItemCount,
  totalPdfPageCount,
  totalPdfBytes,
  documentClassificationCounts,
  renderFindingCounts,
  sourceSummaries,
  layoutSummaries,
  answerStateSummaries,
  scenarios,
  nextTask: allPass
    ? "GLM-S08_DeployedClassicUIAndD0Closeout"
    : "GLM-S07_AnswerKeyBoundaryDefectFullFix",
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
  questionItemCount: manifest.questionItemCount,
  answerItemCount: manifest.answerItemCount,
  totalPdfPageCount: manifest.totalPdfPageCount,
  documentClassificationCounts,
  renderFindingCounts,
  failingSources: sourceSummaries.filter((summary) => summary.acceptancePassCount !== 6),
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
