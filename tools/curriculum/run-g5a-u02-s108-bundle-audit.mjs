import path from "node:path";
import { pathToFileURL } from "node:url";

const bundle = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const patternSpecId = "ps_g5a_u02_remainder_transfer";
const kind = "remainder_transfer_story_witness";
const report = { task: "G5AU02-S108", scenarioCount: 0, passCount: 0, scenarioFamilies: [], failures: [] };

try {
  const runtime = await import(`${pathToFileURL(path.resolve(bundle)).href}?s108=${Date.now()}`);
  const result = runtime.buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [patternSpecId],
    questionCount: 64,
    generationSeed: 810000,
    includeAnswerKey: true,
    questionRowsPerPage: 4,
  });
  if (!result?.ok) throw new Error(`generation:${JSON.stringify(result?.errors ?? [])}`);
  if (result.worksheetDocument.questionItems.length !== 64) report.failures.push("question_count");
  if (result.worksheetDocument.answerKeyItems.length !== 64) report.failures.push("answer_count");
  const families = new Set();
  for (const question of result.worksheetDocument.questionItems) {
    report.scenarioCount += 1;
    const errors = [];
    if (question.questionDisplayModel?.kind !== kind) errors.push("display_kind");
    if (question.promptCompletenessStatus !== "visible_unique_solution_data_complete") errors.push("prompt_status");
    if (typeof question.prompt !== "string" || question.prompt.length < 24) errors.push("prompt_missing");
    if (!question.prompt.includes("除數關係：") || !question.prompt.includes("原分裝：") || !question.prompt.includes("改分裝：")) errors.push("witness_missing");
    if (!question.questionDisplayModel?.scenarioFamilyId) errors.push("scenario_family_missing");
    else families.add(question.questionDisplayModel.scenarioFamilyId);
    for (const key of ["answer", "structuredAnswer", "answerText"]) if (key in question) errors.push(`leak:${key}`);
    if (errors.length) report.failures.push({ questionNumber: question.questionNumber, errors });
    else report.passCount += 1;
  }
  report.scenarioFamilies = [...families].sort();
  if (families.size !== 4) report.failures.push({ stage: "family_coverage", count: families.size, families: [...families] });
} catch (error) {
  report.failures.push({ stage: "runtime", error: error.message });
}

report.status = report.scenarioCount === 64 && report.passCount === 64 && report.scenarioFamilies.length === 4 && report.failures.length === 0
  ? "PASS_64_OF_64_BUNDLED_S108_REMAINDER_CONTEXT"
  : "FAIL";
console.log(JSON.stringify(report, null, 2));
if (report.status === "FAIL") process.exit(1);
