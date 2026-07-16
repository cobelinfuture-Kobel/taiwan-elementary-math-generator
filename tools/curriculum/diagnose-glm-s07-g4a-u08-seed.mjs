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
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { validateG4AU08GeneratorValidatorDomainQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-generator-validator-domain-fullfix.js";
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

function sourceUnitOptions(seed, questionCount = 40) {
  return {
    sourceId,
    selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
  };
}

const sweepRows = [];
const coveredPatternSpecs = new Set();
const coveredShapeVariants = new Set();
let sweepQuestionCount = 0;
let sweepRepairedQuestionCount = 0;
for (let seedIndex = 0; seedIndex < 128; seedIndex += 1) {
  const seed = `glm-s07-domain-sweep-${seedIndex}`;
  const result = generateBatchABrowserQuestions(sourceUnitOptions(seed));
  const row = {
    seed,
    ok: result.ok === true,
    questionCount: result.questions?.length ?? 0,
    fullFix: jsonSafe(result.fullFix ?? null),
    generationErrors: jsonSafe(result.errors ?? []),
    blockingValidation: null,
    domainErrors: [],
  };
  if (result.ok === true) {
    sweepQuestionCount += result.questions.length;
    sweepRepairedQuestionCount += result.fullFix?.repairedQuestionCount ?? 0;
    for (const question of result.questions) {
      coveredPatternSpecs.add(question.patternSpecId);
      if (question.shapeVariant) coveredShapeVariants.add(question.shapeVariant);
      const domain = validateG4AU08GeneratorValidatorDomainQuestion(question);
      if (!domain.ok) {
        row.domainErrors.push({
          patternSpecId: question.patternSpecId,
          shapeVariant: question.shapeVariant,
          expression: question.expression,
          errors: jsonSafe(domain.errors),
        });
      }
    }
    row.blockingValidation = jsonSafe(validateBatchABrowserQuestions(result.questions));
  }
  sweepRows.push(row);
}
const sweepFailures = sweepRows.filter((row) => (
  !row.ok || row.domainErrors.length > 0 || row.blockingValidation?.ok !== true
));

const diagnostic = {
  schemaVersion: "glm-s07-g4a-u08-failing-seed-diagnostic-v2",
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
  sweep: {
    seedCount: sweepRows.length,
    expectedQuestionCount: 128 * 40,
    actualQuestionCount: sweepQuestionCount,
    repairedQuestionCount: sweepRepairedQuestionCount,
    coveredPatternSpecs: [...coveredPatternSpecs].sort(),
    coveredShapeVariants: [...coveredShapeVariants].sort(),
    failureCount: sweepFailures.length,
    failures: sweepFailures,
    rows: sweepRows,
  },
};
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  scenarioId: diagnostic.scenarioId,
  planOk: planValidation.ok,
  generationOk: generation.ok,
  generationQuestionCount: generation.questions?.length ?? 0,
  generationFullFix: generation.fullFix ?? null,
  generationErrors: generation.errors ?? [],
  worksheetOk: worksheet.ok,
  worksheetErrorCount: worksheet.errors?.length ?? 0,
  sweepSeedCount: diagnostic.sweep.seedCount,
  sweepQuestionCount: diagnostic.sweep.actualQuestionCount,
  sweepRepairedQuestionCount: diagnostic.sweep.repairedQuestionCount,
  coveredPatternSpecCount: diagnostic.sweep.coveredPatternSpecs.length,
  coveredShapeVariantCount: diagnostic.sweep.coveredShapeVariants.length,
  sweepFailureCount: diagnostic.sweep.failureCount,
  sweepFailures: diagnostic.sweep.failures,
  outputPath: path.relative(repositoryRoot, outputPath),
}, null, 2));
