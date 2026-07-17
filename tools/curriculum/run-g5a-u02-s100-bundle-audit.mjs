import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s100-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERNS = [
  ["ps_g5a_u02_factor_relation_equivalence", "factor_relation_dual_witness"],
  ["ps_g5a_u02_factor_enumeration_trial_division", "trial_division_table"],
  ["ps_g5a_u02_factor_list_from_pairs", "factor_pairs_to_ordered_list"],
  ["ps_g5a_u02_factor_statement_judgement", "controlled_divisibility_statement"],
  ["ps_g5a_u02_problem_type_classification", "number_theory_problem_type_scenario"],
  ["ps_g5a_u02_complete_factor_list_statement_evaluation", "factor_list_reasoning_statement_set"],
];

const authority = {
  task: "G5AU02-S100_P0MethodWitnessLanguageAndReasoningFullFix",
  bundlePath: BUNDLE_PATH,
  status: "PENDING",
  requestedScenarioCount: PATTERNS.length * 64,
  scenarioCount: 0,
  passCount: 0,
  failureCount: 0,
  patterns: [],
  failures: [],
};

function inspectQuestion(question, expectedKind) {
  const errors = [];
  if (question?.questionDisplayModel?.kind !== expectedKind) {
    errors.push(`G5AU02_S100_BUNDLE_DISPLAY_KIND_MISMATCH:${question?.questionDisplayModel?.kind ?? "missing"}`);
  }
  if (question?.promptCompletenessStatus !== "visible_unique_solution_data_complete") {
    errors.push("G5AU02_S100_BUNDLE_PROMPT_STATUS_INVALID");
  }
  if (typeof question?.prompt !== "string" || question.prompt.length < 24) {
    errors.push("G5AU02_S100_BUNDLE_VISIBLE_PROMPT_REQUIRED");
  }
  for (const forbidden of ["answer", "structuredAnswer", "answerText"]) {
    if (Object.prototype.hasOwnProperty.call(question ?? {}, forbidden)) {
      errors.push(`G5AU02_S100_BUNDLE_ANSWER_LEAKAGE:${forbidden}`);
    }
  }
  return errors;
}

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s100=${Date.now()}`);
  authority.exports = Object.keys(runtime).sort();
  if (typeof runtime.buildG5AU02BrowserDynamicWorksheet !== "function") {
    throw new Error("G5AU02_S100_BUNDLE_BUILD_EXPORT_MISSING");
  }

  for (let patternIndex = 0; patternIndex < PATTERNS.length; patternIndex += 1) {
    const [patternSpecId, expectedKind] = PATTERNS[patternIndex];
    const row = {
      patternSpecId,
      expectedKind,
      requestedCount: 64,
      generatedCount: 0,
      passCount: 0,
      failureCount: 0,
      failures: [],
    };
    try {
      const result = runtime.buildG5AU02BrowserDynamicWorksheet({
        sourceId: "g5a_u02_5a02",
        patternSpecIds: [patternSpecId],
        questionCount: 64,
        generationSeed: 400000 + patternIndex * 1000,
        includeAnswerKey: true,
        questionRowsPerPage: 4,
      });
      if (!result?.ok) throw new Error(`G5AU02_S100_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
      row.generatedCount = result.worksheetDocument.questionItems.length;
      if (row.generatedCount !== 64) row.failures.push({ stage: "count", errors: ["G5AU02_S100_BUNDLE_EXACT_COUNT_MISMATCH"] });
      if (result.worksheetDocument.answerKeyItems.length !== 64) row.failures.push({ stage: "answer_count", errors: ["G5AU02_S100_BUNDLE_ANSWER_COUNT_MISMATCH"] });

      for (const question of result.worksheetDocument.questionItems) {
        authority.scenarioCount += 1;
        const errors = inspectQuestion(question, expectedKind);
        if (errors.length === 0) {
          row.passCount += 1;
          authority.passCount += 1;
        } else {
          row.failureCount += 1;
          authority.failureCount += 1;
          row.failures.push({ questionNumber: question.questionNumber, errors });
        }
      }
      for (const structuralFailure of row.failures.filter((failure) => failure.stage)) {
        row.failureCount += 1;
        authority.failureCount += 1;
        authority.failures.push({ patternSpecId, ...structuralFailure });
      }
    } catch (error) {
      row.failureCount += 1;
      authority.failureCount += 1;
      row.failures.push({ stage: "pattern_runtime", error: error.message });
    }
    authority.patterns.push(row);
    authority.failures.push(...row.failures.filter((failure) => !failure.stage || failure.stage === "pattern_runtime")
      .map((failure) => ({ patternSpecId, ...failure })));
  }
} catch (error) {
  authority.failureCount += 1;
  authority.failures.push({ stage: "bundle_import", error: error.message, stack: error.stack });
}

authority.status = authority.scenarioCount === 384
  && authority.passCount === 384
  && authority.failureCount === 0
  ? "PASS_384_OF_384_BUNDLED_S100_METHOD_MODELS"
  : "FAIL";

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status !== "PASS_384_OF_384_BUNDLED_S100_METHOD_MODELS") process.exit(1);
