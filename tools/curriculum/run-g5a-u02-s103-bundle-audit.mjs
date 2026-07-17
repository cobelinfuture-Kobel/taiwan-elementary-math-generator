import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = "docs/curriculum/output/g5a-u02-s103-bundle-audit/current.json";
const BUNDLE_PATH = "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
const PATTERN_ID = "ps_g5a_u02_multi_constraint_digit_code";
const GENERATED_PROFILE_ID = "generated_unique_code_v1";
const SOURCE_PROFILE_ID = "source_1725_reference";

const authority = {
  task: "G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation",
  bundlePath: BUNDLE_PATH,
  status: "PENDING",
  requestedCount: 64,
  generatedCount: 0,
  passCount: 0,
  failureCount: 0,
  generatedProfileCount: 0,
  sourceReferenceDefaultCount: 0,
  uniqueAnswerCount: 0,
  failures: [],
};

function inspectQuestion(question, answer) {
  const errors = [];
  const model = question?.questionDisplayModel;
  if (question?.patternSpecId !== PATTERN_ID) errors.push("G5AU02_S103_BUNDLE_PATTERN_MISMATCH");
  if (model?.kind !== "unique_digit_code_constraints") errors.push("G5AU02_S103_BUNDLE_DISPLAY_KIND_MISMATCH");
  if (model?.profileId !== GENERATED_PROFILE_ID) errors.push("G5AU02_P0_SOURCE_REFERENCE_REPEATED_AS_DEFAULT");
  if (model?.productionAllocation !== "default_regeneration") errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  if (model?.solutionCount !== 1) errors.push("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE");
  if (model?.candidateDomain?.distinctDigits !== true || model?.candidateDomain?.nonzeroThousandsDigit !== true) {
    errors.push("G5AU02_P0_DIGIT_CODE_PROFILE_INVALID");
  }
  if (!Array.isArray(model?.conditions) || model.conditions.length !== 4) {
    errors.push("G5AU02_P0_DIGIT_CODE_CONDITION_INSUFFICIENT");
  }
  if (typeof question?.prompt !== "string" || question.prompt.length < 40) errors.push("G5AU02_VISIBLE_PROMPT_REQUIRED");
  if (model?.conditions?.some((condition) => !question.prompt.includes(condition.text))) {
    errors.push("G5AU02_PROMPT_VISIBLE_DATA_INCOMPLETE");
  }
  for (const forbidden of ["answer", "structuredAnswer", "answerText", "digits", "value", "expectedSolution", "sourceSolution"]) {
    if (Object.prototype.hasOwnProperty.call(model ?? {}, forbidden)) errors.push(`G5AU02_S103_ANSWER_LEAKAGE:${forbidden}`);
  }
  if (answer?.structuredAnswer?.value === 1725) errors.push("G5AU02_P0_SOURCE_REFERENCE_REPEATED_AS_DEFAULT");
  if (!Number.isInteger(answer?.structuredAnswer?.value)
    || new Set(answer?.structuredAnswer?.digits ?? []).size !== 4
    || answer?.structuredAnswer?.digits?.[0] === 0) {
    errors.push("G5AU02_P0_DIGIT_CODE_NOT_UNIQUE");
  }
  return errors;
}

try {
  const runtime = await import(`${pathToFileURL(path.resolve(BUNDLE_PATH)).href}?s103=${Date.now()}`);
  if (typeof runtime.buildG5AU02BrowserDynamicWorksheet !== "function") {
    throw new Error("G5AU02_S103_BUNDLE_BUILD_EXPORT_MISSING");
  }
  const result = runtime.buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [PATTERN_ID],
    questionCount: 64,
    generationSeed: 103640,
    includeAnswerKey: true,
    questionRowsPerPage: 4,
  });
  if (!result?.ok) throw new Error(`G5AU02_S103_BUNDLE_GENERATION_BLOCKED:${JSON.stringify(result?.errors ?? [])}`);
  const questions = result.worksheetDocument.questionItems;
  const answers = result.worksheetDocument.answerKeyItems;
  authority.generatedCount = questions.length;
  const answerValues = new Set();
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const answer = answers[index];
    const errors = inspectQuestion(question, answer);
    if (question?.questionDisplayModel?.profileId === GENERATED_PROFILE_ID) authority.generatedProfileCount += 1;
    if (question?.questionDisplayModel?.profileId === SOURCE_PROFILE_ID || answer?.structuredAnswer?.value === 1725) {
      authority.sourceReferenceDefaultCount += 1;
    }
    if (Number.isInteger(answer?.structuredAnswer?.value)) answerValues.add(answer.structuredAnswer.value);
    if (errors.length === 0) authority.passCount += 1;
    else {
      authority.failureCount += 1;
      authority.failures.push({ questionNumber: question?.questionNumber ?? index + 1, errors });
    }
  }
  authority.uniqueAnswerCount = answerValues.size;
} catch (error) {
  authority.failureCount += 1;
  authority.failures.push({ stage: "bundle_runtime", error: error.message, stack: error.stack });
}

authority.status = authority.generatedCount === 64
  && authority.passCount === 64
  && authority.failureCount === 0
  && authority.generatedProfileCount === 64
  && authority.sourceReferenceDefaultCount === 0
  && authority.uniqueAnswerCount === 8
  ? "PASS_64_OF_64_BUNDLED_GENERATED_CODES_SOURCE_REFERENCE_EXCLUDED"
  : "FAIL";

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(authority, null, 2)}\n`, "utf8");
console.log(JSON.stringify(authority, null, 2));
if (authority.status === "FAIL") process.exit(1);
