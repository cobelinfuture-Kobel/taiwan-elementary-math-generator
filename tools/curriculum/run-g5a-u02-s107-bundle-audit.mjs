import path from "node:path";
import { pathToFileURL } from "node:url";

const bundle = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const patterns = [
  ["ps_g5a_u02_divisor_candidate_selection", "candidate_circle_selection_row"],
  ["ps_g5a_u02_complete_factor_list_unknown_values", "symbolic_complete_factor_relation_table"],
  ["ps_g5a_u02_common_factor_concept_identification", "marked_common_factor_row"],
];
const report = { task: "G5AU02-S107", scenarioCount: 0, passCount: 0, failures: [] };

try {
  const runtime = await import(`${pathToFileURL(path.resolve(bundle)).href}?s107=${Date.now()}`);
  for (let index = 0; index < patterns.length; index += 1) {
    const [patternSpecId, kind] = patterns[index];
    const result = runtime.buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 710000 + index * 1000,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    if (!result?.ok) throw new Error(`generation:${patternSpecId}:${JSON.stringify(result?.errors ?? [])}`);
    if (result.worksheetDocument.questionItems.length !== 64) report.failures.push(`question_count:${patternSpecId}`);
    if (result.worksheetDocument.answerKeyItems.length !== 64) report.failures.push(`answer_count:${patternSpecId}`);
    for (const question of result.worksheetDocument.questionItems) {
      report.scenarioCount += 1;
      const errors = [];
      if (question.questionDisplayModel?.kind !== kind) errors.push("display_kind");
      if (question.promptCompletenessStatus !== "visible_unique_solution_data_complete") errors.push("prompt_status");
      if (typeof question.prompt !== "string" || question.prompt.length < 16) errors.push("prompt_missing");
      for (const key of ["answer", "structuredAnswer", "answerText"]) if (key in question) errors.push(`leak:${key}`);
      if (errors.length) report.failures.push({ patternSpecId, questionNumber: question.questionNumber, errors });
      else report.passCount += 1;
    }
  }
} catch (error) {
  report.failures.push({ stage: "runtime", error: error.message });
}

report.status = report.scenarioCount === 192 && report.passCount === 192 && report.failures.length === 0
  ? "PASS_192_OF_192_BUNDLED_S107_SELECTION_SYMBOLIC_COMMON"
  : "FAIL";
console.log(JSON.stringify(report, null, 2));
if (report.status === "FAIL") process.exit(1);
