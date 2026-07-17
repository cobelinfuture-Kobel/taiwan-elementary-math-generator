import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdir, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const ARTIFACT_DIR = "docs/curriculum/output/g5a-u02-pre-s104-public-semantic-regeneration";
const CONTRACT = JSON.parse(await readFile(
  new URL("../../data/curriculum/contracts/G5AU02_PreS104_PublicWorksheetSemanticProjectionFullFixContract.json", import.meta.url),
  "utf8",
));
const PATTERN_IDS = CONTRACT.patternScope;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

function displayModelFromQuestion(question) {
  return {
    questionNumberText: `${question.questionNumber}.`,
    blankedDisplayText: question.prompt,
    patternId: question.patternSpecId,
    answerModelShape: question.answerModelId,
    responsePrompt: "答：________________",
    questionDisplayModel: question.questionDisplayModel,
  };
}

function buildRegeneratedDocument() {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: PATTERN_IDS,
    questionCount: 60,
    generationSeed: 104001,
    includeAnswerKey: true,
    questionRowsPerPage: 3,
    answerRowsPerPage: 6,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  const source = result.worksheetDocument;
  const questionDisplayModels = source.questionItems.map(displayModelFromQuestion);
  const displayByNumber = new Map(questionDisplayModels.map((model, index) => [index + 1, model]));
  const questionPages = [];
  for (let index = 0; index < source.questionItems.length; index += 6) {
    const pageNumber = questionPages.length + 1;
    questionPages.push({
      pageNumber,
      columns: 2,
      rowsPerPage: 3,
      cells: source.questionItems.slice(index, index + 6).map((question) => ({
        cellType: "question",
        questionNumber: question.questionNumber,
        displayModel: displayByNumber.get(question.questionNumber),
      })),
    });
  }
  const answerDisplayByNumber = new Map(source.questionItems.map((question) => [question.questionNumber, question.questionDisplayModel]));
  const answerKeyPages = [];
  for (let index = 0; index < source.answerKeyItems.length; index += 6) {
    answerKeyPages.push({
      pageNumber: answerKeyPages.length + 1,
      columns: 2,
      rowsPerPage: 3,
      cells: source.answerKeyItems.slice(index, index + 6).map((answer) => ({
        cellType: "answerKey",
        answerKeyItem: {
          ...answer,
          promptText: source.questionItems[answer.questionNumber - 1]?.prompt,
          questionDisplayModel: answerDisplayByNumber.get(answer.questionNumber),
        },
      })),
    });
  }
  const document = {
    unitId: "g5a_u02",
    title: "五上因數與公因數｜Pre-S104語意修正版",
    questionDisplayModels,
    questionItems: source.questionItems,
    answerKeyItems: source.answerKeyItems,
    questionPages,
    answerKeyPages,
  };
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  return { document, html };
}

function recordsFor(document, patternSpecId) {
  return document.questionItems.filter((item) => item.patternSpecId === patternSpecId);
}

function answersFor(document, patternSpecId) {
  return document.answerKeyItems.filter((item) => item.patternSpecId === patternSpecId);
}

test("Pre-S104 regeneration keeps sixty questions and six page cells", () => {
  const { document } = buildRegeneratedDocument();
  assert.equal(document.questionItems.length, 60);
  assert.equal(document.answerKeyItems.length, 60);
  assert.ok(document.questionPages.every((page) => page.cells.length === 6));
  assert.ok(document.answerKeyPages.every((page) => page.cells.length === 6));
});

test("Pre-S104 public wording contains no internal placeholders or decimal-like statement numbers", () => {
  const { document, html } = buildRegeneratedDocument();
  const unknownQuestions = recordsFor(document, "ps_g5a_u02_complete_factor_list_unknown_values");
  const unknownAnswers = answersFor(document, "ps_g5a_u02_complete_factor_list_unknown_values");
  assert.ok(unknownQuestions.length > 0);
  assert.ok(unknownQuestions.every((item) => item.questionDisplayModel.sequence.some((entry) => entry.role === "unknown" && ["甲", "乙", "丙", "丁"].includes(entry.text))));
  assert.ok(unknownAnswers.every((item) => /甲=/.test(item.answerText)));
  const joined = `${document.questionItems.map((item) => item.prompt).join("\n")}\n${document.answerKeyItems.map((item) => item.answerText).join("\n")}\n${html}`;
  assert.doesNotMatch(joined, /\bp\d+\b/i);
  assert.doesNotMatch(joined, /\b\d+\.\d+\s+是/);
  assert.match(joined, /①/);
});

test("Pre-S104 answer key satisfies explanation and unit instructions", () => {
  const { document } = buildRegeneratedDocument();
  const judgementAnswers = answersFor(document, "ps_g5a_u02_factor_statement_judgement");
  assert.ok(judgementAnswers.length > 0);
  assert.ok(judgementAnswers.every((answer) => answer.answerText.includes("÷")
    && (answer.answerText.includes("沒有餘數") || answer.answerText.includes("不能整除"))));
  const groupingAnswers = answersFor(document, "ps_g5a_u02_maximum_equal_grouping");
  assert.ok(groupingAnswers.length > 0);
  assert.ok(groupingAnswers.every((answer) => answer.answerText.endsWith("組")));
  const statementAnswers = answersFor(document, "ps_g5a_u02_complete_factor_list_statement_evaluation");
  assert.ok(statementAnswers.every((answer) => answer.answerText.includes("①") && answer.answerText.includes("④")));
});

test("Pre-S104 public renderer emits the integrated semantic profile without answer leakage", () => {
  const { document, html } = buildRegeneratedDocument();
  assert.match(html, /data-renderer-profile="g5a_u02_s104_p0_integrated_v1"/);
  assert.match(html, /data-layout-columns="2" data-layout-rows="3"/);
  assert.match(html, /data-g5a-u02-s107-kind="symbolic_complete_factor_relation_table"/);
  assert.doesNotMatch(html, /data-g5a-u02-public-symbol-kind="symbolic_complete_factor_sequence"/);
  assert.doesNotMatch(html, /source_1725_reference/);
  assert.doesNotMatch(html, /ps_g5a_u02_|fm_g5a_u02_|fmc_g5a_u02_|pg_g5a_u02_|kp_g5a_u02_/);
  const questionSection = html.split("worksheet-section--answer-key")[0];
  const digitAnswers = answersFor(document, "ps_g5a_u02_multi_constraint_digit_code");
  for (const answer of digitAnswers) assert.equal(questionSection.includes(String(answer.structuredAnswer.value)), false);
});

test("Pre-S104 regeneration tool emits HTML PDF and acceptance authority", async () => {
  await rm(ARTIFACT_DIR, { recursive: true, force: true });
  const result = await run(process.execPath, ["tools/curriculum/generate-g5a-u02-pre-s104-semantic-regeneration.mjs"]);
  assert.equal(result.code, 0, `${result.stdout}\n${result.stderr}`);
  const authority = JSON.parse(await readFile(`${ARTIFACT_DIR}/current.json`, "utf8"));
  assert.equal(authority.status, "PASS_60_OF_60_PUBLIC_SEMANTIC_REGENERATION");
  assert.equal(authority.questionCount, 60);
  assert.equal(authority.answerCount, 60);
  assert.equal(authority.htmlPdfAcceptance.questionPdfPages, authority.questionPageCount);
  assert.equal(authority.htmlPdfAcceptance.answerPdfPages, authority.answerPageCount);
  assert.ok((await stat(`${ARTIFACT_DIR}/question.pdf`)).size > 0);
  assert.ok((await stat(`${ARTIFACT_DIR}/answer.pdf`)).size > 0);
});
