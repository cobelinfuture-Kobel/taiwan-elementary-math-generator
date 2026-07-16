import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);

export const GLM_S08_QUESTION_COUNT = 18;
export const GLM_S08_BOUNDARY_LAYOUT_IDS = Object.freeze(["3x5", "2x6", "1x7"]);
export const GLM_S08_RELOAD_LAYOUT_ID = "1x7";

export function readGLMS08Contract() {
  return JSON.parse(readFileSync(contractPath, "utf8"));
}

export function buildGLMS08DeployedScenarioPlan() {
  const contract = readGLMS08Contract();
  const boundarySet = new Set(GLM_S08_BOUNDARY_LAYOUT_IDS);
  const scenarios = [];
  for (const unit of contract.publicUnits) {
    for (const layout of contract.approvedLayouts) {
      scenarios.push(Object.freeze({
        scenarioId: `${unit.sourceId}:${layout.layoutId}:answer-off`,
        sourceId: unit.sourceId,
        unitCode: unit.unitCode,
        unitTitle: unit.title,
        layoutId: layout.layoutId,
        columns: layout.columns,
        rowsPerPage: layout.rowsPerPage,
        includeAnswerKey: false,
        answerStateId: "answer-off",
        questionCount: GLM_S08_QUESTION_COUNT,
        generationSeed: `glm-s08:${unit.sourceId}:${layout.layoutId}:answer-off`,
        printRequired: boundarySet.has(layout.layoutId),
        reloadRequired: false,
      }));
    }
    for (const layout of contract.approvedLayouts.filter((row) => boundarySet.has(row.layoutId))) {
      scenarios.push(Object.freeze({
        scenarioId: `${unit.sourceId}:${layout.layoutId}:answer-on`,
        sourceId: unit.sourceId,
        unitCode: unit.unitCode,
        unitTitle: unit.title,
        layoutId: layout.layoutId,
        columns: layout.columns,
        rowsPerPage: layout.rowsPerPage,
        includeAnswerKey: true,
        answerStateId: "answer-on",
        questionCount: GLM_S08_QUESTION_COUNT,
        generationSeed: `glm-s08:${unit.sourceId}:${layout.layoutId}:answer-on`,
        printRequired: true,
        reloadRequired: layout.layoutId === GLM_S08_RELOAD_LAYOUT_ID,
      }));
    }
  }
  return Object.freeze(scenarios);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const plan = buildGLMS08DeployedScenarioPlan();
  console.log(JSON.stringify({
    task: "GLM-S08_DeployedClassicUIAndD0Closeout",
    scenarioCount: plan.length,
    answerOffScenarioCount: plan.filter((row) => !row.includeAnswerKey).length,
    answerOnScenarioCount: plan.filter((row) => row.includeAnswerKey).length,
    printScenarioCount: plan.filter((row) => row.printRequired).length,
    reloadScenarioCount: plan.filter((row) => row.reloadRequired).length,
    uniqueSourceCount: new Set(plan.map((row) => row.sourceId)).size,
    uniqueLayoutCount: new Set(plan.filter((row) => !row.includeAnswerKey).map((row) => row.layoutId)).size,
  }, null, 2));
}
