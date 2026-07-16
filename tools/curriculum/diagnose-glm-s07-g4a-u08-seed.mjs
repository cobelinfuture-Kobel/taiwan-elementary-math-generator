import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
import { adaptGlobalPublicSourceUnitPlan } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  normalizeG4AU08AllCanonicalPublicPlan,
  validateG4AU08AllCanonicalPublicPlan,
} from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputDirectory = path.join(repositoryRoot, "docs/curriculum/output/glm-s07-g4a-u08-seed-diagnostic");
const outputPath = path.join(outputDirectory, "current.json");

const sourceId = "g4a_u08_4a08";
const generationSeed = "glm-s07:g4a_u08_4a08:3x5:answer-on";
const state = createConfigState();
setBatchASourceId(state, sourceId);
setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
setBatchAQuestionCount(state, 18);
setBatchAOrdering(state, "groupedByPattern");
setBatchAIncludeAnswerKey(state, true);
setBatchAGenerationSeed(state, generationSeed);
setBatchAPrintLayout(state, { columns: 3, rowsPerPage: 5 });
setBatchALayoutMode(state, "custom_with_caps");

const publicPlan = getBatchAWorksheetPlan(state);
const sourceUnitAdaptation = adaptGlobalPublicSourceUnitPlan(publicPlan);
const adaptedPlan = sourceUnitAdaptation.plan;
const normalizedPlan = normalizeG4AU08AllCanonicalPublicPlan(adaptedPlan);
const planValidation = validateG4AU08AllCanonicalPublicPlan(normalizedPlan);
const generation = generateBatchABrowserQuestions(adaptedPlan);
const worksheet = buildWorksheetDocumentFromState(state);

function jsonSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

const diagnostic = {
  schemaVersion: "glm-s07-g4a-u08-failing-seed-diagnostic-v1",
  task: "GLM-S07_AnswerKeyAndMaximumBoundaryStress",
  scenarioId: "g4a_u08_4a08:3x5:answer-on",
  sourceId,
  generationSeed,
  publicPlan: jsonSafe(publicPlan),
  sourceUnitAdaptation: jsonSafe(sourceUnitAdaptation),
  normalizedPlan: jsonSafe(normalizedPlan),
  allocation: jsonSafe(normalizedPlan.allocation ?? []),
  planValidation: jsonSafe(planValidation),
  generation: jsonSafe(generation),
  worksheet: jsonSafe(worksheet),
};
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  scenarioId: diagnostic.scenarioId,
  planOk: planValidation.ok,
  allocationCount: diagnostic.allocation.length,
  generationOk: generation.ok,
  generationErrorCount: generation.errors?.length ?? 0,
  generationErrors: generation.errors ?? [],
  worksheetOk: worksheet.ok,
  worksheetErrorCount: worksheet.errors?.length ?? 0,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
