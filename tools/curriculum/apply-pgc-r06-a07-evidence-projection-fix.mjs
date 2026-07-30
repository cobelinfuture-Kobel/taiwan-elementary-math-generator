import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const marker = "PGC-R06 A07 canonical evidence projection compatibility";

function patch(relativePath, replacements) {
  const targetPath = path.join(repoRoot, relativePath);
  let source = fs.readFileSync(targetPath, "utf8");
  if (source.includes(marker)) return false;
  for (const [before, after, label] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`PGC_R06_A07_PROJECTION_ANCHOR_MISSING:${relativePath}:${label}`);
    source = source.replace(before, after);
  }
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  return true;
}

const helperAnchor = `const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");`;
const helperBlock = `${helperAnchor}

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.replace(/\\s+/g, " ").trim();
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

function evidenceItems(document) {
  for (const [projection, candidate] of [
    ["questionItems", document?.questionItems],
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ]) {
    if (Array.isArray(candidate) && candidate.length > 0) return { projection, items: candidate };
  }
  return { projection: "none", items: [] };
}`;

const oldMaterializerRun = `function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((question) => String(question.prompt ?? question.promptText ?? question.blankedDisplayText ?? "").trim());
  return {
    seed: generationSeed,
    ok: result?.ok === true,
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    uniquePromptCount: new Set(prompts).size,
    itemSetSignature: digest([...prompts].sort()),
    orderedWorksheetSignature: digest(prompts),
  };
}`;

const newMaterializerRun = `function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const { projection, items: questions } = evidenceItems(document);
  const prompts = questions.map(promptText);
  return {
    seed: generationSeed,
    ok: result?.ok === true,
    errorCodes: unique((result?.errors ?? []).map((error) => error?.code ?? String(error))),
    evidenceProjection: projection,
    questionCount: questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    uniquePromptCount: new Set(prompts).size,
    itemSetSignature: digest([...prompts].sort()),
    orderedWorksheetSignature: digest(prompts),
  };
}`;

const testHelperAnchor = `const signature = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");`;
const testHelperBlock = `${testHelperAnchor}

function textValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.replace(/\\s+/g, " ").trim();
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

function evidenceItems(document) {
  for (const [projection, candidate] of [
    ["questionItems", document?.questionItems],
    ["questionDisplayModels", document?.questionDisplayModels],
    ["generatedQuestions", document?.generatedQuestions],
    ["questions", document?.questions],
    ["answerKeyItems", document?.answerKeyItems],
  ]) {
    if (Array.isArray(candidate) && candidate.length > 0) return { projection, items: candidate };
  }
  return { projection: "none", items: [] };
}`;

const oldTestRun = `function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const questions = document?.questions ?? document?.generatedQuestions ?? [];
  const prompts = questions.map((question) => String(question.prompt ?? question.promptText ?? question.blankedDisplayText ?? "").trim());
  return {
    ok: result?.ok === true,
    errors: result?.errors ?? [],
    questionCount: document?.questionCount ?? questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    itemSetSignature: signature([...prompts].sort()),
    orderedWorksheetSignature: signature(prompts),
  };
}`;

const newTestRun = `function runRoute(route, generationSeed) {
  const result = buildWorksheetDocumentFromPlan(planFor(route, generationSeed));
  const document = result?.worksheetDocument;
  const { projection, items: questions } = evidenceItems(document);
  const prompts = questions.map(promptText);
  return {
    ok: result?.ok === true,
    errors: result?.errors ?? [],
    evidenceProjection: projection,
    questionCount: questions.length,
    answerKeyItemCount: document?.answerKeyItems?.length ?? 0,
    missingPromptCount: prompts.filter((prompt) => !prompt).length,
    duplicatePromptCount: prompts.length - new Set(prompts).size,
    itemSetSignature: signature([...prompts].sort()),
    orderedWorksheetSignature: signature(prompts),
  };
}`;

const materializerChanged = patch(
  "tools/curriculum/materialize-pgc-r06-a07-final-global-live-d0-closeout.mjs",
  [
    [helperAnchor, helperBlock, "materializer-evidence-helpers"],
    [`    ordering: "groupedByPattern",`, `    ordering: "shuffleAcrossPatterns",`, "materializer-ordering"],
    [`    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],`, `    selectedPatternGroupIds: [...(route.generationPatternGroupIds ?? [])],`, "materializer-generation-groups"],
    [oldMaterializerRun, newMaterializerRun, "materializer-run-route"],
  ],
);

const testChanged = patch(
  "tests/curriculum/pgc-r06-a07-final-global-live-d0-closeout.test.js",
  [
    [testHelperAnchor, testHelperBlock, "test-evidence-helpers"],
    [`    ordering: "groupedByPattern",`, `    ordering: "shuffleAcrossPatterns",`, "test-ordering"],
    [`    selectedPatternGroupIds: [...(route.publicPatternGroupIds ?? [])],`, `    selectedPatternGroupIds: [...(route.generationPatternGroupIds ?? [])],`, "test-generation-groups"],
    [oldTestRun, newTestRun, "test-run-route"],
  ],
);

console.log(`PGC_R06_A07_EVIDENCE_PROJECTION_FIX=${JSON.stringify({
  status: materializerChanged || testChanged ? "APPLIED" : "ALREADY_APPLIED",
  materializerChanged,
  testChanged,
})}`);
