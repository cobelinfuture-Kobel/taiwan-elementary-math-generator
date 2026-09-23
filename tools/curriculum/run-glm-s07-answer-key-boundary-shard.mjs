import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  GLM_S07_QUESTION_COUNT,
  GLM_S07_SHARD_COUNT,
  scenariosForGLMS07Shard,
} from "./glm-s07-scenario-plan.mjs";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, "../..");
const outputRoot = path.join(
  repositoryRoot,
  "docs/curriculum/output/glm-s07-answer-key-boundary-stress",
);
const temporaryRoot = path.join("/tmp", "glm-s07-answer-key-boundary-stress");
const basePrintCss = readFileSync(
  path.join(repositoryRoot, "site/assets/styles/print-styles.css"),
  "utf8",
);

function parseShardIndex() {
  const argument = process.argv.find((item) => item.startsWith("--shard="));
  const value = Number(argument?.slice("--shard=".length));
  if (!Number.isInteger(value) || value < 0 || value >= GLM_S07_SHARD_COUNT) {
    throw new Error(`GLM_S07_SHARD_ARGUMENT_INVALID:${argument ?? "missing"}`);
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function issueCodes(result) {
  const issues = [
    ...(result?.errors ?? []),
    ...(result?.validation?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.validation?.warnings ?? []),
  ];
  return unique(issues.map((issue) => issue?.code ?? String(issue)));
}

function createScenarioState(scenario) {
  const state = createConfigState();
  setBatchASourceId(state, scenario.sourceId);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, scenario.questionCount);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, scenario.includeAnswerKey);
  setBatchAGenerationSeed(state, scenario.generationSeed);
  setBatchAPrintLayout(state, {
    columns: scenario.requestedColumns,
    rowsPerPage: scenario.requestedRowsPerPage,
  });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function questionModels(document) {
  if (Array.isArray(document?.questionDisplayModels)) return document.questionDisplayModels;
  if (Array.isArray(document?.generatedQuestions)) return document.generatedQuestions;
  if (Array.isArray(document?.questionItems)) return document.questionItems;
  return [];
}

function answerItems(document) {
  return Array.isArray(document?.answerKeyItems) ? document.answerKeyItems : [];
}

function questionNumber(item, index) {
  const value = Number(item?.questionNumber);
  return Number.isInteger(value) && value > 0 ? value : index + 1;
}

function itemId(item) {
  return item?.questionId ?? item?.id ?? null;
}

function alignmentResult(document, scenario) {
  const questions = questionModels(document);
  const answers = answerItems(document);
  const expectedNumbers = Array.from({ length: scenario.questionCount }, (_, index) => index + 1);
  const questionNumbers = questions.map(questionNumber);
  const answerNumbers = answers.map(questionNumber);
  const questionIds = questions.map(itemId);
  const answerIds = answers.map(itemId);
  const completeQuestionIds = questionIds.every(Boolean);
  const completeAnswerIds = answerIds.every(Boolean);
  const errors = [];
  if (JSON.stringify(questionNumbers) !== JSON.stringify(expectedNumbers)) {
    errors.push("QUESTION_NUMBER_SEQUENCE_MISMATCH");
  }
  if (scenario.includeAnswerKey) {
    if (JSON.stringify(answerNumbers) !== JSON.stringify(expectedNumbers)) {
      errors.push("ANSWER_NUMBER_SEQUENCE_MISMATCH");
    }
    if (completeQuestionIds && completeAnswerIds && JSON.stringify(questionIds) !== JSON.stringify(answerIds)) {
      errors.push("QUESTION_ANSWER_ID_ALIGNMENT_MISMATCH");
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    questionNumbers,
    answerNumbers,
    questionIdsComplete: completeQuestionIds,
    answerIdsComplete: completeAnswerIds,
  };
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function classifyDocument(result, scenario) {
  const document = result?.worksheetDocument;
  if (!result?.ok || !document) return { code: "GENERATION_BLOCKED", alignment: null };
  const questions = questionModels(document);
  const answers = answerItems(document);
  const questionPages = Array.isArray(document.questionPages) ? document.questionPages : [];
  const answerPages = Array.isArray(document.answerKeyPages) ? document.answerKeyPages : [];
  const resolution = document?.layoutResolution ?? {};
  const resolvedQuestion = resolution.resolvedQuestionLayout ?? {};
  const resolvedAnswer = resolution.resolvedAnswerLayout ?? {};
  const snapshotAnswer = document?.configSnapshot?.answerKeyPrintLayout ?? {};
  const printOptions = document?.printOptions ?? {};
  const alignment = alignmentResult(document, scenario);

  if (questions.length !== scenario.questionCount) return { code: "QUESTION_COUNT_MISMATCH", alignment };
  if (questionPages.length === 0) return { code: "QUESTION_PAGE_MISSING", alignment };
  if (resolution.layoutMode !== "exact_approved_matrix") return { code: "LAYOUT_MODE_INVALID", alignment };
  if (resolution.layoutExact !== true) return { code: "QUESTION_LAYOUT_NOT_EXACT", alignment };
  if (resolution.capped !== false) return { code: "QUESTION_LAYOUT_CAPPED", alignment };
  if (
    positiveInteger(resolvedQuestion.columns) !== scenario.requestedColumns
    || positiveInteger(resolvedQuestion.rowsPerPage) !== scenario.requestedRowsPerPage
  ) return { code: "QUESTION_LAYOUT_RESOLUTION_MISMATCH", alignment };
  if (!alignment.ok) return { code: alignment.errors[0], alignment };

  if (!scenario.includeAnswerKey) {
    if (answers.length !== 0 || answerPages.length !== 0) return { code: "ANSWER_KEY_OFF_LEAK", alignment };
    if (printOptions.showAnswerKey !== false) return { code: "ANSWER_KEY_OFF_METADATA_INVALID", alignment };
    return { code: "PASS", alignment };
  }

  if (answers.length !== scenario.questionCount) return { code: "ANSWER_ITEM_COUNT_MISMATCH", alignment };
  if (answerPages.length === 0) return { code: "ANSWER_PAGE_MISSING", alignment };
  const answerColumns = positiveInteger(resolvedAnswer.columns);
  const answerRows = positiveInteger(resolvedAnswer.rowsPerPage);
  if (!answerColumns || !answerRows) return { code: "ANSWER_LAYOUT_INVALID", alignment };
  if (
    positiveInteger(printOptions.answerKeyColumns) !== answerColumns
    || positiveInteger(printOptions.answerKeyRowsPerPage) !== answerRows
  ) return { code: "ANSWER_PRINT_OPTIONS_MISMATCH", alignment };
  if (
    positiveInteger(snapshotAnswer.columns) !== answerColumns
    || positiveInteger(snapshotAnswer.rowsPerPage) !== answerRows
  ) return { code: "ANSWER_CONFIG_SNAPSHOT_MISMATCH", alignment };
  if (printOptions.showAnswerKey !== true) return { code: "ANSWER_KEY_ON_METADATA_INVALID", alignment };
  return { code: "PASS", alignment };
}

function injectBaseCss(html) {
  return html.replace("</head>", `<style id="glm-s07-base-print-css">${basePrintCss}</style></head>`);
}

function renderedHtml(result, scenario) {
  return injectBaseCss(renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: `${scenario.unitCode} ${scenario.unitTitle}｜${scenario.layoutId}｜${scenario.answerStateId}｜GLM-S07`,
    stylesheetHref: "",
  }));
}

function buildScenario(scenario) {
  let result;
  let exception = null;
  try {
    result = buildWorksheetDocumentFromState(createScenarioState(scenario));
  } catch (error) {
    exception = {
      name: error?.name ?? "Error",
      message: String(error?.message ?? error),
      stack: error?.stack ?? null,
    };
    result = { ok: false, errors: [{ code: "GLM_S07_GENERATION_EXCEPTION" }] };
  }
  const document = result?.worksheetDocument ?? null;
  const classification = classifyDocument(result, scenario);
  const questions = questionModels(document);
  const answers = answerItems(document);
  const base = {
    ...clone(scenario),
    requestedLayout: {
      columns: scenario.requestedColumns,
      rowsPerPage: scenario.requestedRowsPerPage,
    },
    resolvedQuestionLayout: clone(document?.layoutResolution?.resolvedQuestionLayout ?? null),
    resolvedAnswerLayout: clone(document?.layoutResolution?.resolvedAnswerLayout ?? null),
    documentClassification: classification.code,
    alignment: clone(classification.alignment),
    generationOk: Boolean(result?.ok && document),
    generationIssueCodes: issueCodes(result),
    generationException: exception,
    generatedQuestionCount: questions.length,
    answerItemCount: answers.length,
    documentQuestionPageCount: document?.questionPages?.length ?? 0,
    documentAnswerPageCount: document?.answerKeyPages?.length ?? 0,
    rendererProfileId: document?.rendererProfile?.profileId ?? null,
    documentSchemaName: document?.schemaName ?? null,
    printOptions: clone(document?.printOptions ?? null),
    configAnswerLayout: clone(document?.configSnapshot?.answerKeyPrintLayout ?? null),
    layoutMode: document?.layoutResolution?.layoutMode ?? null,
    layoutExact: document?.layoutResolution?.layoutExact ?? null,
    layoutCapped: document?.layoutResolution?.capped ?? null,
    renderAttempted: false,
    renderFindings: [],
    renderStatus: "NOT_ATTEMPTED",
    acceptanceStatus: "FAIL",
  };
  if (classification.code !== "PASS") return { scenario: base, html: null };
  const html = renderedHtml(result, scenario);
  return {
    scenario: {
      ...base,
      htmlSha256: sha256(html),
      htmlBytes: Buffer.byteLength(html),
    },
    html,
  };
}

async function inspectHtmlAndCreatePdf(browser, htmlPath, pdfPath, screenshotPath, scenario) {
  const consoleErrors = [];
  const pageErrors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));
  await page.emulateMedia({ media: "print" });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  const dom = await page.evaluate(() => {
    function uniqueElements(selectors) {
      return [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))];
    }
    const visible = (node) => getComputedStyle(node).display !== "none";
    const questionPages = uniqueElements([
      '[data-page-type="question"]',
      ".worksheet-page--questions",
      ".g4b-u04-page--questions",
      ".g5a-u08-page--questions",
      ".g5a-u02-page--questions",
    ]).filter(visible);
    const answerPages = uniqueElements([
      '[data-page-type="answer"]',
      '[data-page-type="answer-key"]',
      ".worksheet-page--answer-key",
      ".worksheet-page--answers",
      ".g4b-u04-page--answers",
      ".g5a-u08-page--answers",
      ".g5a-u02-page--answers",
    ]).filter(visible);
    const questionCards = uniqueElements([
      ".worksheet-cell--question",
      ".g4b-u04-cell--question",
      ".g5a-u08-cell--question",
      ".g5a-u02-card--question",
    ]).filter(visible);
    const answerCards = uniqueElements([
      ".worksheet-cell--answer-key",
      ".worksheet-cell--answer",
      ".g4b-u04-cell--answer",
      ".g5a-u08-cell--answer",
      ".g5a-u02-card--answer",
    ]).filter(visible);
    const questionPrompts = uniqueElements([
      ".worksheet-cell--question .worksheet-cell__prompt",
      ".g4b-u04-cell--question .g4b-u04-cell__prompt",
      ".g5a-u08-cell--question .g5a-u08-cell__prompt",
      ".g5a-u02-card--question .g5a-u02-card__prompt",
    ]).filter(visible);
    const answerTexts = uniqueElements([
      ".worksheet-cell--answer-key .worksheet-cell__answer",
      ".worksheet-cell--answer .worksheet-cell__answer",
      ".g4b-u04-cell--answer .g4b-u04-cell__answer",
      ".g5a-u08-cell--answer .g5a-u08-cell__answer",
      ".g5a-u02-card--answer .g5a-u02-card__answer",
    ]).filter(visible);
    const pages = [...questionPages, ...answerPages];
    const cards = [...questionCards, ...answerCards];
    const textNodes = [...questionPrompts, ...answerTexts];
    const overflowCards = cards.filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const overflowText = textNodes.filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const overflowPages = pages.filter((node) => (
      node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1
    ));
    const missingQuestionPrompts = questionPrompts.filter((node) => !node.textContent?.trim());
    const missingAnswerTexts = answerTexts.filter((node) => !node.textContent?.trim());
    const overlaps = [];
    for (const worksheetPage of pages) {
      const pageCards = cards.filter((card) => worksheetPage.contains(card));
      const rectangles = pageCards.map((card) => ({
        text: card.textContent?.trim().slice(0, 80) ?? "",
        rect: card.getBoundingClientRect(),
      }));
      for (let left = 0; left < rectangles.length; left += 1) {
        for (let right = left + 1; right < rectangles.length; right += 1) {
          const a = rectangles[left].rect;
          const b = rectangles[right].rect;
          const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapWidth > 0.5 && overlapHeight > 0.5) {
            overlaps.push({
              left: rectangles[left].text,
              right: rectangles[right].text,
              overlapWidth,
              overlapHeight,
            });
          }
        }
      }
    }
    return {
      questionPageCount: questionPages.length,
      answerPageCount: answerPages.length,
      questionCardCount: questionCards.length,
      answerCardCount: answerCards.length,
      questionPromptCount: questionPrompts.length,
      answerTextCount: answerTexts.length,
      cardOverflowCount: overflowCards.length,
      textOverflowCount: overflowText.length,
      pageOverflowCount: overflowPages.length,
      interCardOverlapCount: overlaps.length,
      missingQuestionPromptCount: missingQuestionPrompts.length,
      missingAnswerTextCount: missingAnswerTexts.length,
      firstCardOverflow: overflowCards[0]?.outerHTML.slice(0, 800) ?? null,
      firstTextOverflow: overflowText[0]?.outerHTML.slice(0, 800) ?? null,
      firstOverlap: overlaps[0] ?? null,
    };
  });

  const expectedAnswerCount = scenario.includeAnswerKey ? scenario.questionCount : 0;
  const structuralFailure = dom.questionPageCount === 0
    || dom.questionCardCount !== scenario.questionCount
    || dom.questionPromptCount !== scenario.questionCount
    || dom.answerCardCount !== expectedAnswerCount
    || (scenario.includeAnswerKey ? dom.answerPageCount === 0 : dom.answerPageCount !== 0)
    || (scenario.includeAnswerKey ? dom.answerTextCount !== expectedAnswerCount : dom.answerTextCount !== 0);
  const visualFailure = structuralFailure
    || dom.cardOverflowCount > 0
    || dom.textOverflowCount > 0
    || dom.pageOverflowCount > 0
    || dom.interCardOverlapCount > 0
    || dom.missingQuestionPromptCount > 0
    || dom.missingAnswerTextCount > 0;
  if (visualFailure) await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });
  await page.close();
  return {
    ...dom,
    consoleErrorCount: consoleErrors.length,
    consoleErrors: consoleErrors.slice(0, 10),
    pageErrorCount: pageErrors.length,
    pageErrors: pageErrors.slice(0, 10),
    screenshotCreated: visualFailure,
  };
}

function runPythonInspector(inputPath, outputPath) {
  const result = spawnSync(
    "python3",
    ["tools/curriculum/inspect-glm-s06-pdfs.py", inputPath, outputPath],
    { cwd: repositoryRoot, encoding: "utf8", stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`GLM_S07_PDF_INSPECTOR_FAILED:${result.status}`);
}

function renderFindingCodes(dom, pdf, scenario) {
  const findings = [];
  const expectedAnswerCount = scenario.includeAnswerKey ? scenario.questionCount : 0;
  const expectedTotalPages = dom.questionPageCount + dom.answerPageCount;
  if (dom.questionPageCount === 0) findings.push("QUESTION_PAGE_MISSING");
  if (dom.questionCardCount !== scenario.questionCount) findings.push("QUESTION_CARD_COUNT_MISMATCH");
  if (dom.questionPromptCount !== scenario.questionCount) findings.push("QUESTION_PROMPT_COUNT_MISMATCH");
  if (dom.answerCardCount !== expectedAnswerCount) findings.push("ANSWER_CARD_COUNT_MISMATCH");
  if (scenario.includeAnswerKey && dom.answerPageCount === 0) findings.push("ANSWER_PAGE_MISSING");
  if (!scenario.includeAnswerKey && dom.answerPageCount !== 0) findings.push("ANSWER_PAGE_OFF_LEAK");
  if (dom.answerTextCount !== expectedAnswerCount) findings.push("ANSWER_TEXT_COUNT_MISMATCH");
  if (dom.missingQuestionPromptCount > 0) findings.push("QUESTION_PROMPT_MISSING");
  if (dom.missingAnswerTextCount > 0) findings.push("ANSWER_TEXT_MISSING");
  if (dom.cardOverflowCount > 0 || dom.textOverflowCount > 0 || dom.pageOverflowCount > 0) {
    findings.push("OVERFLOW");
  }
  if (dom.interCardOverlapCount > 0) findings.push("OVERLAP");
  if (pdf.blankPdfPageCount > 0) findings.push("BLANK_PAGE");
  if (pdf.pdfBoundingBoxOverflowCount > 0) findings.push("PDF_BOUNDING_BOX_OVERFLOW");
  if (pdf.pdfPageCount !== expectedTotalPages) findings.push("PDF_PAGE_COUNT_MISMATCH");
  if (dom.consoleErrorCount > 0) findings.push("CONSOLE_ERROR");
  if (dom.pageErrorCount > 0) findings.push("PAGE_ERROR");
  return unique(findings);
}

const shardIndex = parseShardIndex();
const shardScenarios = scenariosForGLMS07Shard(shardIndex);
const shardOutputDirectory = path.join(outputRoot, `shard-${shardIndex}`);
const shardTemporaryDirectory = path.join(temporaryRoot, `shard-${shardIndex}`);
rmSync(shardOutputDirectory, { recursive: true, force: true });
rmSync(shardTemporaryDirectory, { recursive: true, force: true });
mkdirSync(shardOutputDirectory, { recursive: true });
mkdirSync(shardTemporaryDirectory, { recursive: true });

const built = shardScenarios.map(buildScenario);
const htmlCache = new Map();
const browser = await chromium.launch({
  headless: true,
  args: ["--allow-file-access-from-files"],
});
try {
  for (const entry of built) {
    if (!entry.html) continue;
    const htmlHash = entry.scenario.htmlSha256;
    let cached = htmlCache.get(htmlHash);
    if (!cached) {
      const cacheId = `render-${htmlCache.size + 1}`;
      const htmlPath = path.join(shardTemporaryDirectory, `${cacheId}.html`);
      const pdfPath = path.join(shardTemporaryDirectory, `${cacheId}.pdf`);
      const screenshotPath = path.join(
        shardOutputDirectory,
        `${entry.scenario.sourceId}-${entry.scenario.layoutId}-${entry.scenario.answerStateId}-failure.png`,
      );
      writeFileSync(htmlPath, `${entry.html}\n`, "utf8");
      const dom = await inspectHtmlAndCreatePdf(
        browser,
        htmlPath,
        pdfPath,
        screenshotPath,
        entry.scenario,
      );
      cached = { pdfPath, screenshotPath, dom };
      htmlCache.set(htmlHash, cached);
    }
    entry.scenario.renderAttempted = true;
    entry.scenario.dom = clone(cached.dom);
    entry.scenario.transientPdfPath = cached.pdfPath;
    entry.scenario.failureScreenshot = cached.dom.screenshotCreated
      ? path.relative(repositoryRoot, cached.screenshotPath)
      : null;
  }
} finally {
  await browser.close();
}

const uniquePdfs = [...new Set(
  built.map((entry) => entry.scenario.transientPdfPath).filter(Boolean),
)];
const pdfInputPath = path.join(shardTemporaryDirectory, "pdf-input.json");
const pdfOutputPath = path.join(shardTemporaryDirectory, "pdf-output.json");
writeFileSync(
  pdfInputPath,
  `${JSON.stringify({ pdfs: uniquePdfs.map((pdfPath) => ({ pdfPath })) }, null, 2)}\n`,
  "utf8",
);
if (uniquePdfs.length > 0) runPythonInspector(pdfInputPath, pdfOutputPath);
const pdfInspection = uniquePdfs.length > 0
  ? JSON.parse(readFileSync(pdfOutputPath, "utf8")).results
  : {};

for (const entry of built) {
  const scenario = entry.scenario;
  if (!scenario.renderAttempted) continue;
  const pdf = pdfInspection[path.resolve(scenario.transientPdfPath)];
  if (!pdf) throw new Error(`GLM_S07_PDF_RESULT_MISSING:${scenario.scenarioId}`);
  scenario.pdf = pdf;
  scenario.renderFindings = renderFindingCodes(scenario.dom, pdf, scenario);
  scenario.renderStatus = scenario.renderFindings.length === 0 ? "PASS" : "DEFECTS_DETECTED";
  scenario.acceptanceStatus = (
    scenario.documentClassification === "PASS" && scenario.renderStatus === "PASS"
  ) ? "PASS" : "FAIL";
  delete scenario.transientPdfPath;
}

const documentClassificationCounts = {};
const renderFindingCounts = {};
for (const entry of built) {
  const scenario = entry.scenario;
  documentClassificationCounts[scenario.documentClassification] = (
    documentClassificationCounts[scenario.documentClassification] ?? 0
  ) + 1;
  for (const code of scenario.renderFindings) {
    renderFindingCounts[code] = (renderFindingCounts[code] ?? 0) + 1;
  }
}
const acceptancePassCount = built.filter((entry) => entry.scenario.acceptanceStatus === "PASS").length;
const manifest = {
  schemaVersion: "glm-s07-answer-key-boundary-shard-v1",
  task: "GLM-S07_AnswerKeyAndMaximumBoundaryStress",
  status: acceptancePassCount === built.length ? "SHARD_ACCEPTANCE_PASS" : "SHARD_ACCEPTANCE_FAILED",
  shardIndex,
  shardCount: GLM_S07_SHARD_COUNT,
  scenarioCount: built.length,
  unitSourceIds: unique(built.map((entry) => entry.scenario.sourceId)),
  generatedScenarioCount: built.filter((entry) => entry.scenario.generationOk).length,
  renderedScenarioCount: built.filter((entry) => entry.scenario.renderAttempted).length,
  acceptancePassCount,
  uniqueRenderedHtmlCount: htmlCache.size,
  documentClassificationCounts,
  renderFindingCounts,
  scenarios: built.map((entry) => entry.scenario),
};
const manifestPath = path.join(shardOutputDirectory, "manifest.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: manifest.status,
  shardIndex,
  scenarioCount: manifest.scenarioCount,
  generatedScenarioCount: manifest.generatedScenarioCount,
  renderedScenarioCount: manifest.renderedScenarioCount,
  acceptancePassCount: manifest.acceptancePassCount,
  documentClassificationCounts,
  renderFindingCounts,
  manifestPath: path.relative(repositoryRoot, manifestPath),
}, null, 2));
