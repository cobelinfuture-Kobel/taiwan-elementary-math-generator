import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s97-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERN_IDS = [
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_multi_constraint_digit_code",
];

const authority = {
  task: "G5AU02-S97_SourceParityPromptCompletenessAndSemanticFullFix",
  bundlePath: BUNDLE_PATH,
  status: "PENDING",
  audit: null,
  scenarioCount: 0,
  passCount: 0,
  failureCount: 0,
  patterns: [],
  failures: [],
};

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s97=${Date.now()}`);
  authority.exports = Object.keys(runtime).sort();
  authority.audit = runtime.auditG5AU02BrowserDynamicRuntime();
  if (!authority.audit?.ok) {
    authority.failures.push({ stage: "runtime_audit", errors: authority.audit?.errors ?? ["audit_missing"] });
  }

  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    const patternResult = {
      patternSpecId,
      requestedCount: 20,
      generatedCount: 0,
      passCount: 0,
      failureCount: 0,
      failures: [],
    };
    try {
      if (typeof runtime.buildG5AU02BrowserDynamicWorksheet !== "function") {
        throw new Error("G5AU02_S97_BUNDLE_BUILD_EXPORT_MISSING");
      }
      const result = runtime.buildG5AU02BrowserDynamicWorksheet({
        sourceId: "g5a_u02_5a02",
        patternSpecIds: [patternSpecId],
        questionCount: 20,
        generationSeed: 970001 + patternIndex * 100,
        includeAnswerKey: true,
      });
      if (!result?.ok) throw new Error(`G5AU02_S97_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
      patternResult.generatedCount = result.worksheetDocument.questionItems.length;
      for (const question of result.worksheetDocument.questionItems) {
        authority.scenarioCount += 1;
        const errors = [];
        if (!question.questionDisplayModel) errors.push("G5AU02_VISIBLE_DISPLAY_MODEL_REQUIRED");
        if (question.promptCompletenessStatus !== "visible_unique_solution_data_complete") {
          errors.push("G5AU02_VISIBLE_PROMPT_STATUS_INVALID");
        }
        if (typeof question.prompt !== "string" || question.prompt.length < 20) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
        if (errors.length === 0) {
          patternResult.passCount += 1;
          authority.passCount += 1;
        } else {
          patternResult.failureCount += 1;
          authority.failureCount += 1;
          patternResult.failures.push({ questionNumber: question.questionNumber, errors });
        }
      }
    } catch (error) {
      patternResult.failureCount += 1;
      authority.failureCount += 1;
      patternResult.failures.push({ stage: "pattern_runtime", error: error.message });
    }
    authority.patterns.push(patternResult);
    authority.failures.push(...patternResult.failures.map((failure) => ({ patternSpecId, ...failure })));
  }
} catch (error) {
  authority.failureCount += 1;
  authority.failures.push({ stage: "bundle_import", error: error.message, stack: error.stack });
}

authority.status = authority.audit?.ok
  && authority.scenarioCount === 120
  && authority.passCount === 120
  && authority.failureCount === 0
  ? "PASS_120_OF_120_BUNDLED_VISIBLE_PROMPTS"
  : "FAIL";

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status !== "PASS_120_OF_120_BUNDLED_VISIBLE_PROMPTS") process.exit(1);
