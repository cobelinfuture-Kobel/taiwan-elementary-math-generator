import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s101-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERNS = [
  ["ps_g5a_u02_equal_partition_all_segment_counts", "partition_count_length_pairs", "partitionPairListAnswer"],
  ["ps_g5a_u02_rectangle_square_side_lengths", "rectangle_square_partition_diagram", "lengthListAnswer"],
  ["ps_g5a_u02_square_tile_area_possibilities", "square_tile_side_area_chain", "tileSideAreaPairListAnswer"],
];

const authority = {
  task: "G5AU02-S101_P0PartitionAndGeometryRepresentationFullFix",
  bundlePath: BUNDLE_PATH,
  status: "PENDING",
  requestedScenarioCount: PATTERNS.length * 64,
  scenarioCount: 0,
  passCount: 0,
  failureCount: 0,
  patterns: [],
  failures: [],
};

function inspectQuestion(question, expectedKind, expectedAnswerModelId) {
  const errors = [];
  if (question?.questionDisplayModel?.kind !== expectedKind) errors.push("G5AU02_S101_BUNDLE_DISPLAY_KIND_MISMATCH");
  if (question?.answerModelId !== expectedAnswerModelId) errors.push("G5AU02_S101_BUNDLE_ANSWER_MODEL_MISMATCH");
  if (question?.promptCompletenessStatus !== "visible_unique_solution_data_complete") errors.push("G5AU02_S101_BUNDLE_PROMPT_STATUS_INVALID");
  if (typeof question?.prompt !== "string" || question.prompt.length < 8) errors.push("G5AU02_S101_BUNDLE_VISIBLE_PROMPT_REQUIRED");
  const scale = question?.questionDisplayModel?.diagramScale;
  if (scale && (!Number.isInteger(scale.cellCount) || scale.cellCount < 1 || scale.cellCount > 81)) errors.push("G5AU02_S101_BUNDLE_DIAGRAM_UNBOUNDED");
  for (const forbidden of ["answer", "structuredAnswer", "answerText"]) {
    if (Object.prototype.hasOwnProperty.call(question ?? {}, forbidden)) errors.push(`G5AU02_S101_BUNDLE_ANSWER_LEAKAGE:${forbidden}`);
  }
  return errors;
}

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s101=${Date.now()}`);
  for (let patternIndex = 0; patternIndex < PATTERNS.length; patternIndex += 1) {
    const [patternSpecId, expectedKind, expectedAnswerModelId] = PATTERNS[patternIndex];
    const row = { patternSpecId, expectedKind, expectedAnswerModelId, requestedCount: 64, generatedCount: 0, passCount: 0, failureCount: 0, failures: [] };
    try {
      const result = runtime.buildG5AU02BrowserDynamicWorksheet({
        sourceId: "g5a_u02_5a02",
        patternSpecIds: [patternSpecId],
        questionCount: 64,
        generationSeed: 501000 + patternIndex * 1000,
        includeAnswerKey: true,
        questionRowsPerPage: 4,
      });
      if (!result?.ok) throw new Error(`G5AU02_S101_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
      row.generatedCount = result.worksheetDocument.questionItems.length;
      for (const question of result.worksheetDocument.questionItems) {
        authority.scenarioCount += 1;
        const errors = inspectQuestion(question, expectedKind, expectedAnswerModelId);
        if (errors.length === 0) { row.passCount += 1; authority.passCount += 1; }
        else { row.failureCount += 1; authority.failureCount += 1; row.failures.push({ questionNumber: question.questionNumber, errors }); }
      }
    } catch (error) {
      row.failureCount += 1;
      authority.failureCount += 1;
      row.failures.push({ stage: "pattern_runtime", error: error.message });
    }
    authority.patterns.push(row);
    authority.failures.push(...row.failures.map((failure) => ({ patternSpecId, ...failure })));
  }
} catch (error) {
  authority.failureCount += 1;
  authority.failures.push({ stage: "bundle_import", error: error.message, stack: error.stack });
}

authority.status = authority.scenarioCount === 192 && authority.passCount === 192 && authority.failureCount === 0
  ? "PASS_192_OF_192_BUNDLED_S101_REPRESENTATIONS"
  : "FAIL";
await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status === "FAIL") process.exit(1);
