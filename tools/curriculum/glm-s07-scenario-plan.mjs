import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const contractPath = path.join(
  repositoryRoot,
  "data/curriculum/contracts/GLM_S00_PublicCompletedUnit18LayoutContract.json",
);

export const GLM_S07_SHARD_COUNT = 5;
export const GLM_S07_QUESTION_COUNT = 18;
export const GLM_S07_BOUNDARY_LAYOUT_IDS = Object.freeze(["3x5", "2x6", "1x7"]);
export const GLM_S07_ANSWER_STATES = Object.freeze([
  Object.freeze({ answerStateId: "answer-off", includeAnswerKey: false }),
  Object.freeze({ answerStateId: "answer-on", includeAnswerKey: true }),
]);

export function readGLMS07Contract() {
  return JSON.parse(readFileSync(contractPath, "utf8"));
}

export function buildGLMS07ScenarioPlan() {
  const contract = readGLMS07Contract();
  const layoutById = new Map(contract.approvedLayouts.map((layout) => [layout.layoutId, layout]));
  const boundaryLayouts = GLM_S07_BOUNDARY_LAYOUT_IDS.map((layoutId) => {
    const layout = layoutById.get(layoutId);
    if (!layout) throw new Error(`GLM_S07_BOUNDARY_LAYOUT_MISSING:${layoutId}`);
    return layout;
  });
  const scenarios = [];
  for (const [unitIndex, unit] of contract.publicUnits.entries()) {
    const shardIndex = unitIndex % GLM_S07_SHARD_COUNT;
    for (const layout of boundaryLayouts) {
      for (const answerState of GLM_S07_ANSWER_STATES) {
        scenarios.push(Object.freeze({
          scenarioId: `${unit.sourceId}:${layout.layoutId}:${answerState.answerStateId}`,
          sourceId: unit.sourceId,
          unitCode: unit.unitCode,
          unitTitle: unit.title,
          unitIndex,
          shardIndex,
          layoutId: layout.layoutId,
          requestedColumns: layout.columns,
          requestedRowsPerPage: layout.rowsPerPage,
          answerStateId: answerState.answerStateId,
          includeAnswerKey: answerState.includeAnswerKey,
          questionCount: GLM_S07_QUESTION_COUNT,
          generationSeed: `glm-s07:${unit.sourceId}:${layout.layoutId}:${answerState.answerStateId}`,
        }));
      }
    }
  }
  return Object.freeze(scenarios);
}

export function scenariosForGLMS07Shard(shardIndex) {
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= GLM_S07_SHARD_COUNT) {
    throw new Error(`GLM_S07_SHARD_OUT_OF_RANGE:${shardIndex}`);
  }
  return buildGLMS07ScenarioPlan().filter((scenario) => scenario.shardIndex === shardIndex);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const plan = buildGLMS07ScenarioPlan();
  console.log(JSON.stringify({
    task: "GLM-S07_AnswerKeyAndMaximumBoundaryStress",
    scenarioCount: plan.length,
    shardCount: GLM_S07_SHARD_COUNT,
    boundaryLayoutIds: GLM_S07_BOUNDARY_LAYOUT_IDS,
    answerStateIds: GLM_S07_ANSWER_STATES.map((state) => state.answerStateId),
    shardScenarioCounts: Array.from({ length: GLM_S07_SHARD_COUNT }, (_, index) => (
      plan.filter((scenario) => scenario.shardIndex === index).length
    )),
  }, null, 2));
}
