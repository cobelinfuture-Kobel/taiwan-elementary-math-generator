import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s107-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERNS = [
  ["ps_g5a_u02_divisor_candidate_selection", "candidate_circle_selection_row"],
  ["ps_g5a_u02_complete_factor_list_unknown_values", "symbolic_complete_factor_relation_table"],
  ["ps_g5a_u02_common_factor_concept_identification", "marked_common_factor_row"],
];

const authority = {
  task: "G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix",
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
    errors.push(`G5AU02_S107_BUNDLE_DISPLAY_KIND_MISMATCH:${question?.questionDisplayModel?.kind ?? "missing"}`);
  }
  if (question?.promptCompletenessStatus !== "visible_unique_solution_data_complete") {
    errors.push("G5AU02_S107_BUNDLE_PROMPT_STATUS_INVALID");
  }
  if (typeof question?.prompt !== "string" || question.prompt.length < 20) {
    errors.push("G5AU02_S107_BUNDLE_VISIBLE_PROMPT_REQUIRED");
  }
  if (/●|☑|✓|✔/.test(question?.prompt ?? "")) {
    errors.push("G5AU02_S107_BUNDLE_PREMARKED_SELECTION");
  }
  for (const forbidden of ["answer", "structuredAnswer", "answerText"]) {
    if (Object.prototype.hasOwnProperty.call(question ?? {}, forbidden)) {
      errors.push(`G5AU02_S107_BUNDLE_ANSWER_LEAKAGE:${forbidden}`);
    }
  }
  return errors;
}

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s107=${Date.now()}`);
  authority.exports = Object.keys(runtime).sort();
  if (typeof runtime.buildG5AU02BrowserDynamicWorksheet !== "function") {
    throw new Error("G5AU02_S107_BUNDLE_BUILD_EXPORT_MISSING");
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
        generationSeed: 710000 + patternIndex * 1000,
        includeAnswerKey: true,
        questionRowsPerPage: 4,
      });
      if (!result?.ok) throw new Error(`G5AU02_S107_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
      row.generatedCount = result.worksheetDocument.questionItems.length;
      if (row.generatedCount !== 64) row.failures.push({ stage: "count", errors: ["G5AU02_S107_BUNDLE_EXACT_COUNT_MISMATCH"] });
      if (result.worksheetDocument.answerKeyItems.length !== 64) row.failures.push({ stage: "answer_count", errors: ["G5AU02_S107_BUNDLE_ANSWER_COUNT_MISMATCH"] });

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
    authority.failures.push(...row.failures
      .filter((failure) => !failure.stage || failure.stage === "pattern_runtime")
      .map((failure) => ({ patternSpecId, ...failure })));
  }
} catch (error) {
  authority.failureCount += 1;
  authority.failures.push({ stage: "bundle_import", error: error.message, stack: error.stack });
}

authority.status = authority.scenarioCount === 192
  && authority.passCount === 192
  && authority.failureCount === 0
  ? "PASS_192_OF_192_BUNDLED_S107_CANDIDATE_SYMBOLIC_COMMON_FACTOR"
  : "FAIL";

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status !== "PASS_192_OF_192_BUNDLED_S107_CANDIDATE_SYMBOLIC_COMMON_FACTOR") process.exit(1);
