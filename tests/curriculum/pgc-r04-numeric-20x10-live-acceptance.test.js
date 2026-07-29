import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const NUMERIC_LIKE_QUESTION_TYPES = new Set(["numeric", "concept", "operation_estimation"]);
const ACCEPTANCE_SEEDS = Object.freeze(Array.from(
  { length: 10 },
  (_, index) => `pgc-r04-20x10-${String(index + 1).padStart(2, "0")}`,
));
const QUESTION_COUNT = 20;

const safeArray = (value) => Array.isArray(value) ? value : [];

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.replace(/\s+/g, " ").trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function promptText(item) {
  return textValue(
    item?.blankedDisplayText,
    item?.promptText,
    item?.prompt,
    item?.questionText,
    item?.displayText,
    item?.stem,
    item?.equationText,
    item?.content,
    item?.metadataSnapshot?.blankedDisplayText,
    item?.metadataSnapshot?.promptText,
    item?.metadata?.blankedDisplayText,
    item?.metadata?.promptText,
  );
}

function evidenceItems(result) {
  const document = result?.worksheetDocument;
  for (const candidate of [
    document?.questionDisplayModels,
    document?.generatedQuestions,
    document?.questions,
    document?.answerKeyItems,
  ]) {
    if (safeArray(candidate).length > 0) return candidate;
  }
  return [];
}

function planForRoute(route, seed) {
  const plan = {
    sourceId: route.sourceId,
    questionCount: QUESTION_COUNT,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    selectionMode: route.selectionMode,
    selectedKnowledgePointIds: [...safeArray(route.selectedKnowledgePointIds)],
    selectedPatternGroupIds: [...safeArray(route.generationPatternGroupIds)],
    printLayout: { columns: 2, rowsPerPage: 10, showAnswerKeyPage: true },
    questionMode: route.questionType,
  };
  if (route.depthMode) plan.depthMode = route.depthMode;
  if (route.contextMode) plan.contextMode = route.contextMode;
  return plan;
}

function routeNeedsR04(route) {
  return route.legalRoute === true
    && NUMERIC_LIKE_QUESTION_TYPES.has(route.questionType)
    && (route.verifiedMaxQuestionCount < QUESTION_COUNT || route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR");
}

function inspectResult(route, seed, result) {
  const items = evidenceItems(result);
  const prompts = items.map(promptText);
  const answerKeyItems = safeArray(result?.worksheetDocument?.answerKeyItems);
  const errorCodes = safeArray(result?.errors ?? result?.validation?.errors)
    .map((error) => error?.code ?? String(error));
  const failures = [];
  if (result?.ok !== true) failures.push(`ok=${String(result?.ok)}`);
  if (items.length !== QUESTION_COUNT) failures.push(`questions=${items.length}`);
  if (answerKeyItems.length !== QUESTION_COUNT) failures.push(`answers=${answerKeyItems.length}`);
  if (prompts.some((prompt) => !prompt)) failures.push("empty_prompt=true");
  if (new Set(prompts).size !== QUESTION_COUNT) failures.push(`unique=${new Set(prompts).size}`);
  if (errorCodes.length > 0) failures.push(`errors=${errorCodes.join("|")}`);
  if (failures.length > 0) {
    throw new Error(`${route.routeId}:${seed}:${failures.join(":")}`);
  }
  return JSON.stringify(prompts);
}

test("PGC-R04 all diagnosed numeric routes pass 20 questions across 10 seeds", { timeout: 240_000 }, async () => {
  assert.equal(fs.existsSync(contractPath), true, "R03 capacity contract must exist");
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  assert.equal(contract.schemaName, "PublicGeneratorCapacityContractV3");
  const routes = safeArray(contract.routes).filter(routeNeedsR04);
  assert.equal(routes.length, 81);

  const priorDocument = globalThis.document;
  if (typeof globalThis.document === "undefined") {
    globalThis.document = { getElementById: () => null, body: null };
  }
  const { buildWorksheetDocumentFromPlan } = await import("../../site/assets/browser/pipeline/build-worksheet-document.js");

  const failures = [];
  try {
    for (const route of routes) {
      const signatures = [];
      for (const seed of ACCEPTANCE_SEEDS) {
        try {
          const result = buildWorksheetDocumentFromPlan(planForRoute(route, seed));
          signatures.push(inspectResult(route, seed, result));
        } catch (error) {
          failures.push(String(error?.message ?? error));
        }
      }

      try {
        const replaySeed = ACCEPTANCE_SEEDS[0];
        const replayResult = buildWorksheetDocumentFromPlan(planForRoute(route, replaySeed));
        const replaySignature = inspectResult(route, `${replaySeed}:replay`, replayResult);
        if (signatures[0] !== replaySignature) failures.push(`${route.routeId}:same_seed_not_reproducible`);
      } catch (error) {
        failures.push(String(error?.message ?? error));
      }

      if (signatures.length === ACCEPTANCE_SEEDS.length && new Set(signatures).size < 2) {
        failures.push(`${route.routeId}:cross_seed_worksheet_diversity_deficient`);
      }
    }
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }

  assert.deepEqual(failures, []);
});
