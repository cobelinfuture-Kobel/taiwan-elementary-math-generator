import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);

export const GLM_S06_SHARD_COUNT = 5;
export const GLM_S06_QUESTION_COUNT = 18;

export function readGLMS06Contract() {
  return JSON.parse(readFileSync(contractPath, "utf8"));
}

export function buildGLMS06ScenarioPlan() {
  const contract = readGLMS06Contract();
  const scenarios = [];
  for (const [unitIndex, unit] of contract.publicUnits.entries()) {
    const shardIndex = unitIndex % GLM_S06_SHARD_COUNT;
    for (const layout of contract.approvedLayouts) {
      scenarios.push(Object.freeze({
        scenarioId: `${unit.sourceId}:${layout.layoutId}`,
        sourceId: unit.sourceId,
        unitCode: unit.unitCode,
        unitTitle: unit.title,
        unitIndex,
        shardIndex,
        layoutId: layout.layoutId,
        requestedColumns: layout.columns,
        requestedRowsPerPage: layout.rowsPerPage,
        questionCount: GLM_S06_QUESTION_COUNT,
        includeAnswerKey: false,
        generationSeed: `glm-s06:${unit.sourceId}:${layout.layoutId}`,
      }));
    }
  }
  return Object.freeze(scenarios);
}

export function scenariosForShard(shardIndex) {
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= GLM_S06_SHARD_COUNT) {
    throw new Error(`GLM_S06_SHARD_OUT_OF_RANGE:${shardIndex}`);
  }
  return buildGLMS06ScenarioPlan().filter((scenario) => scenario.shardIndex === shardIndex);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const plan = buildGLMS06ScenarioPlan();
  console.log(JSON.stringify({
    task: "GLM-S06_270ScenarioPostFixAcceptance",
    scenarioCount: plan.length,
    shardCount: GLM_S06_SHARD_COUNT,
    shardScenarioCounts: Array.from({ length: GLM_S06_SHARD_COUNT }, (_, index) => (
      plan.filter((scenario) => scenario.shardIndex === index).length
    )),
  }, null, 2));
}
