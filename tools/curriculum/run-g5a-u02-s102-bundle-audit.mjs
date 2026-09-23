import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s102-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERNS = [
  ["ps_g5a_u02_common_factor_enumeration", "parallel_factor_sets_with_intersection", "integerListAnswer"],
  ["ps_g5a_u02_greatest_common_factor", "common_factor_set_with_gcf", "commonFactorAndGcfAnswer"],
];

const authority = {
  task: "G5AU02-S102_P0NontrivialCommonFactorSamplingAndWitnessFullFix",
  bundlePath: BUNDLE_PATH,
  status: "PENDING",
  requestedScenarioCount: PATTERNS.length * 64,
  scenarioCount: 0,
  passCount: 0,
  failureCount: 0,
  patterns: [],
  failures: [],
};

function factorsOf(value) {
  const values = [];
  for (let candidate = 1; candidate <= value; candidate += 1) if (value % candidate === 0) values.push(candidate);
  return values;
}
function gcd(a, b) {
  let left = a;
  let right = b;
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}
function same(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }

function inspectQuestion(question, expectedKind, expectedAnswerModelId) {
  const errors = [];
  const model = question?.questionDisplayModel;
  if (model?.kind !== expectedKind) errors.push("G5AU02_S102_BUNDLE_DISPLAY_KIND_MISMATCH");
  if (question?.answerModelId !== expectedAnswerModelId) errors.push("G5AU02_S102_BUNDLE_ANSWER_MODEL_MISMATCH");
  if (question?.promptCompletenessStatus !== "visible_unique_solution_data_complete") errors.push("G5AU02_S102_BUNDLE_PROMPT_STATUS_INVALID");
  if (typeof question?.prompt !== "string" || question.prompt.length < 8) errors.push("G5AU02_S102_BUNDLE_VISIBLE_PROMPT_REQUIRED");
  if (!Number.isInteger(model?.a) || !Number.isInteger(model?.b) || model.a === model.b) errors.push("G5AU02_S102_BUNDLE_OPERANDS_DEGENERATE");
  const greatest = Number.isInteger(model?.a) && Number.isInteger(model?.b) ? gcd(model.a, model.b) : 0;
  if (greatest < 2 || greatest >= Math.min(model?.a ?? 0, model?.b ?? 0)) errors.push("G5AU02_S102_BUNDLE_GCD_DEGENERATE");
  if (!same(model?.factorSetA, factorsOf(model?.a ?? 1)) || !same(model?.factorSetB, factorsOf(model?.b ?? 1))) {
    errors.push("G5AU02_S102_BUNDLE_FACTOR_SET_WITNESS_INVALID");
  }
  if (same(model?.factorSetA, model?.factorSetB)) errors.push("G5AU02_S102_BUNDLE_FACTOR_SETS_IDENTICAL");
  if (!question.prompt.includes(`甲數 ${model?.a} 的因數：${(model?.factorSetA ?? []).join("、")}`)
    || !question.prompt.includes(`乙數 ${model?.b} 的因數：${(model?.factorSetB ?? []).join("、")}`)) {
    errors.push("G5AU02_S102_BUNDLE_FACTOR_SET_WITNESS_NOT_VISIBLE");
  }
  if (!question.prompt.includes("公因數（兩個因數集合的交集）：________________")) {
    errors.push("G5AU02_S102_BUNDLE_INTERSECTION_TASK_NOT_VISIBLE");
  }
  if (expectedKind === "common_factor_set_with_gcf"
    && !question.prompt.includes("最大公因數（公因數中的最大值）：________________")) {
    errors.push("G5AU02_S102_BUNDLE_GCF_TASK_NOT_VISIBLE");
  }
  for (const forbidden of ["answer", "structuredAnswer", "answerText"]) {
    if (Object.prototype.hasOwnProperty.call(question ?? {}, forbidden)) errors.push(`G5AU02_S102_BUNDLE_ANSWER_LEAKAGE:${forbidden}`);
  }
  return errors;
}

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s102=${Date.now()}`);
  for (let patternIndex = 0; patternIndex < PATTERNS.length; patternIndex += 1) {
    const [patternSpecId, expectedKind, expectedAnswerModelId] = PATTERNS[patternIndex];
    const row = { patternSpecId, expectedKind, expectedAnswerModelId, requestedCount: 64, generatedCount: 0, passCount: 0, failureCount: 0, failures: [] };
    try {
      const result = runtime.buildG5AU02BrowserDynamicWorksheet({
        sourceId: "g5a_u02_5a02",
        patternSpecIds: [patternSpecId],
        questionCount: 64,
        generationSeed: 602000 + patternIndex * 1000,
        includeAnswerKey: true,
        questionRowsPerPage: 4,
      });
      if (!result?.ok) throw new Error(`G5AU02_S102_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
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

authority.status = authority.scenarioCount === 128 && authority.passCount === 128 && authority.failureCount === 0
  ? "PASS_128_OF_128_BUNDLED_S102_COMMON_FACTOR_WITNESSES"
  : "FAIL";
await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status === "FAIL") process.exit(1);
