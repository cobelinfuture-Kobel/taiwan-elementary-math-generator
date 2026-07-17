import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { getG5AU02HiddenWorksheetPatternIds } from "../../src/curriculum/g5a-u02/hidden-worksheet-answer-key.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const TASK = "G5AU02_PreS104_PublicWorksheetSemanticProjectionFullFix_And_Regeneration";
const QUESTION_COUNT = 60;
const GENERATION_SEED = 104001;
const PAGE_SIZE = 6;
const outputDir = resolve("docs/curriculum/output/pre-s104");
const htmlPath = resolve(outputDir, "G5AU02_PreS104_Regenerated60.html");
const manifestPath = resolve(outputDir, "G5AU02_PreS104_Regenerated60.manifest.json");
const auditPath = resolve(outputDir, "G5AU02_PreS104_Regenerated60.audit.json");
const stylesheetPath = resolve("site/assets/styles/print-styles.css");

function chunk(values, size) {
  const rows = [];
  for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size));
  return rows;
}

function countBy(values, key) {
  const counts = {};
  for (const value of values) {
    const id = key(value);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

function buildPrintableDocument(document) {
  const questionPages = chunk(document.questionDisplayModels, PAGE_SIZE).map((records, pageIndex) => ({
    pageNumber: pageIndex + 1,
    columns: 2,
    cells: records.map((displayModel) => ({
      cellType: "question",
      questionNumber: displayModel.questionNumber,
      displayModel,
    })),
  }));
  const answerKeyPages = chunk(document.answerKeyItems, PAGE_SIZE).map((records, pageIndex) => ({
    pageNumber: pageIndex + 1,
    columns: 1,
    cells: records.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem })),
  }));
  return {
    ...document,
    title: "五上因數與公因數｜Pre-S104語意修正版",
    subtitle: "60題題目卷與答案卷",
    questionPages,
    answerKeyPages,
  };
}

function semanticAudit(document, html) {
  const questions = document.questionItems;
  const answers = document.answerKeyItems;
  const answerByNumber = new Map(answers.map((answer) => [answer.questionNumber, answer]));
  const semanticKinds = countBy(questions, (item) => item.questionDisplayModel?.kind ?? "plain_prompt");
  const patternCounts = countBy(questions, (item) => item.patternSpecId);
  const digitQuestions = questions.filter((item) => item.patternSpecId === "ps_g5a_u02_multi_constraint_digit_code");
  const digitAnswers = digitQuestions.map((item) => answerByNumber.get(item.questionNumber));
  const s102Questions = questions.filter((item) => [
    "ps_g5a_u02_common_factor_enumeration",
    "ps_g5a_u02_greatest_common_factor",
  ].includes(item.patternSpecId));

  const questionText = questions.map((item) => item.prompt).join("\n");
  const answerText = answers.map((item) => item.answerText).join("\n");
  const combined = `${questionText}\n${answerText}\n${html}`;
  const internalIdMatches = combined.match(/\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/gi) ?? [];
  const internalPlaceholderMatches = combined.match(/\bp\d+\b/gi) ?? [];
  const decimalLikeNumberingMatches = combined.match(/\b\d+\.\d+\s+是/g) ?? [];

  assert(questions.length === QUESTION_COUNT, "PRE_S104_QUESTION_COUNT_MISMATCH");
  assert(answers.length === QUESTION_COUNT, "PRE_S104_ANSWER_COUNT_MISMATCH");
  assert(Object.keys(patternCounts).length === 22, "PRE_S104_PATTERN_COVERAGE_MISMATCH");
  assert(internalIdMatches.length === 0, "PRE_S104_INTERNAL_ID_LEAKAGE");
  assert(internalPlaceholderMatches.length === 0, "PRE_S104_INTERNAL_PLACEHOLDER_LEAKAGE");
  assert(decimalLikeNumberingMatches.length === 0, "PRE_S104_STATEMENT_NUMBERING_AMBIGUOUS");
  assert(digitQuestions.length >= 2, "PRE_S104_DIGIT_CODE_SAMPLE_INSUFFICIENT");
  assert(digitQuestions.every((item) => item.questionDisplayModel.profileId === "generated_unique_code_v1"), "PRE_S104_SOURCE_PROFILE_REPEATED_AS_DEFAULT");
  assert(digitAnswers.every((item) => item.structuredAnswer.value !== 1725), "PRE_S104_SOURCE_1725_REPEATED_AS_DEFAULT");
  assert(s102Questions.every((item) => {
    const model = item.questionDisplayModel;
    return model.a !== model.b
      && JSON.stringify(model.factorSetA) !== JSON.stringify(model.factorSetB);
  }), "PRE_S104_S102_DEGENERATE_OPERANDS");
  assert(questions.filter((item) => item.patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values")
    .every((item) => item.questionDisplayModel.sequence.some((entry) => entry.role === "unknown" && entry.text === "甲")), "PRE_S104_PUBLIC_SYMBOL_MISSING");
  assert(answers.filter((item) => item.patternSpecId === "ps_g5a_u02_factor_statement_judgement")
    .every((item) => item.answerText.includes("÷") && (item.answerText.includes("沒有餘數") || item.answerText.includes("不能整除"))), "PRE_S104_DIVISIBILITY_EXPLANATION_MISSING");
  assert(answers.filter((item) => item.patternSpecId === "ps_g5a_u02_maximum_equal_grouping")
    .every((item) => item.answerText.endsWith("組")), "PRE_S104_GROUPING_UNIT_MISSING");

  for (const marker of [
    'data-g5a-u02-s101-kind="partition_count_length_pairs"',
    'data-g5a-u02-s101-kind="rectangle_square_partition_diagram"',
    'data-g5a-u02-s101-kind="square_tile_side_area_chain"',
    'data-g5a-u02-s102-kind="parallel_factor_sets_with_intersection"',
    'data-g5a-u02-s102-kind="common_factor_set_with_gcf"',
    'data-g5a-u02-s103-kind="unique_digit_code_constraints"',
    'data-g5a-u02-public-symbol-kind="symbolic_complete_factor_sequence"',
  ]) assert(html.includes(marker), `PRE_S104_SEMANTIC_MARKER_MISSING:${marker}`);

  const questionSection = html.split("worksheet-section--answer-key")[0];
  for (const answer of digitAnswers) {
    assert(!questionSection.includes(String(answer.structuredAnswer.value)), "PRE_S104_DIGIT_ANSWER_LEAKAGE");
  }

  return {
    status: "PASS",
    questionCount: questions.length,
    answerCount: answers.length,
    patternCount: Object.keys(patternCounts).length,
    patternCounts,
    semanticKinds,
    sourceProfileDefaultRepeatCount: 0,
    source1725DefaultRepeatCount: 0,
    internalIdLeakCount: internalIdMatches.length,
    internalPlaceholderLeakCount: internalPlaceholderMatches.length,
    decimalLikeNumberingCount: decimalLikeNumberingMatches.length,
    generatedDigitCodes: digitAnswers.map((item) => item.structuredAnswer.value),
    s102QuestionCount: s102Questions.length,
  };
}

await mkdir(outputDir, { recursive: true });
const patternSpecIds = getG5AU02HiddenWorksheetPatternIds();
const result = buildG5AU02BrowserDynamicWorksheet({
  sourceId: "g5a_u02_5a02",
  patternSpecIds,
  questionCount: QUESTION_COUNT,
  generationSeed: GENERATION_SEED,
  includeAnswerKey: true,
  questionRowsPerPage: PAGE_SIZE,
  answerRowsPerPage: PAGE_SIZE,
});
if (!result?.ok) throw new Error((result?.errors ?? ["PRE_S104_BUILD_FAILED"]).join("\n"));
const projected = projectG5AU02DynamicDocumentForGlobalLayout(result);
if (!projected?.ok) throw new Error((projected?.errors ?? ["PRE_S104_PROJECTION_FAILED"]).join("\n"));
const printable = buildPrintableDocument(projected.worksheetDocument);
const sharedCss = await readFile(stylesheetPath, "utf8");
let html = renderWorksheetDocumentToHtml(printable, { stylesheetHref: "" });
html = html.replace("</head>", `<style id="shared-print-styles">${sharedCss}</style></head>`);
const audit = semanticAudit(printable, html);
const expectedPdfPageCount = printable.questionPages.length + printable.answerKeyPages.length;
const manifest = {
  task: TASK,
  status: "generated_pending_chromium_pdf_verification",
  sourceId: "g5a_u02_5a02",
  generationSeed: GENERATION_SEED,
  questionCount: QUESTION_COUNT,
  answerCount: QUESTION_COUNT,
  canonicalPatternCount: patternSpecIds.length,
  questionPageCount: printable.questionPages.length,
  answerPageCount: printable.answerKeyPages.length,
  expectedPdfPageCount,
  questionColumns: 2,
  answerColumns: 1,
  questionsPerPage: PAGE_SIZE,
  rendererProfile: "g5a_u02_pre_s104_semantic_v1",
  semanticAuditStatus: audit.status,
  sourceProfileDefaultRepeatCount: audit.sourceProfileDefaultRepeatCount,
  source1725DefaultRepeatCount: audit.source1725DefaultRepeatCount,
  internalPlaceholderLeakCount: audit.internalPlaceholderLeakCount,
  decimalLikeNumberingCount: audit.decimalLikeNumberingCount,
  htmlBytes: Buffer.byteLength(html, "utf8"),
  htmlSha256: sha256(html),
};
await writeFile(htmlPath, html, "utf8");
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
