import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createStaticPreviewServer } from "../preview/serve-preview.js";

const SOURCE = "g5a_u10_5a10a1";
const EDGE = "kp_g5a_u10a1_cube_cuboid_edge_length";
const FACE = "kp_g5a_u10a1_cube_cuboid_face_relationship";
const COUNT = 20;
const OUT = path.resolve("tmp/p05f-w5-q018-classic-ui");

mkdirSync(OUT, { recursive: true });

let base = process.env.P05F18_SITE_URL ?? null;
let server = null;
let browser = null;
const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];

async function startLocalSite() {
  if (base) return;
  server = createStaticPreviewServer({
    rootDir: path.resolve("site"),
    defaultIndexRoute: "/index.html",
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("P05F18_LOCAL_SITE_ADDRESS_INVALID");
  base = `http://127.0.0.1:${address.port}/index.html`;
}

async function selectKnowledgePoint(page, knowledgePointId) {
  await page.waitForFunction(
    (id) => Boolean(document.querySelector(`[data-knowledge-point-id="${id}"]`)),
    knowledgePointId,
    { timeout: 120000 },
  );
  await page.locator(`[data-knowledge-point-id="${knowledgePointId}"]`).click();
  await page.waitForFunction(
    (id) => {
      const selected = [...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")]
        .map((node) => node.dataset.knowledgePointId);
      return selected.length === 1 && selected[0] === id;
    },
    knowledgePointId,
    { timeout: 120000 },
  );
}

async function generateAndRead(page, knowledgePointId, targetElement, seed) {
  await selectKnowledgePoint(page, knowledgePointId);
  await page.fill("#batch-a-question-count-input", String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.fill("#generation-seed-input", seed);
  await page.dispatchEvent("#generation-seed-input", "change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");

  await page.locator("#regenerate-button").click();
  await page.waitForFunction(() => {
    const text = document.querySelector("#status-panel")?.textContent ?? "";
    return text.includes("已產生") || text.includes("產生失敗");
  }, null, { timeout: 120000 });

  const status = await page.evaluate(() => ({
    text: document.querySelector("#status-panel")?.textContent?.trim() ?? "",
    tone: document.querySelector("#status-panel")?.dataset?.tone ?? "",
    validation: document.querySelector("#validation-panel")?.textContent?.trim() ?? "",
    errors: document.querySelector("#validation-panel")?.dataset?.hasErrors ?? null,
    srcdoc: document.querySelector("#preview-frame")?.srcdoc?.length ?? 0,
    printDisabled: Boolean(document.querySelector("#print-button")?.disabled),
  }));
  if (
    !status.text.includes(`已產生 ${COUNT} 題`)
    || status.tone !== "success"
    || status.errors !== "false"
    || status.srcdoc <= 0
    || status.printDisabled
  ) {
    throw new Error(`P05F18_GENERATION_${targetElement}:${JSON.stringify(status)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error(`P05F18_FRAME_MISSING_${targetElement}`);
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const worksheet = await frame.evaluate((expectedTargetElement) => {
    const questions = [...document.querySelectorAll(".worksheet-cell--question")];
    const answers = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const pages = [...document.querySelectorAll(".worksheet-page")];
    const diagrams = [...document.querySelectorAll('[data-representation="cube-cuboid-elements-diagram"]')];
    return {
      questionCount: questions.length,
      answerCount: answers.length,
      diagramCount: diagrams.length,
      targetElements: [...new Set(diagrams.map((node) => node.dataset.targetElement))].sort(),
      matchingTargetCount: diagrams.filter((node) => node.dataset.targetElement === expectedTargetElement).length,
      signatures: questions.map((node) => `${node.querySelector(".worksheet-cell__prompt")?.textContent ?? ""}::${node.querySelector("svg")?.outerHTML ?? ""}`),
      overflow: pages.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length,
    };
  }, targetElement);

  const duplicates = worksheet.signatures.length - new Set(worksheet.signatures).size;
  if (
    worksheet.questionCount !== COUNT
    || worksheet.answerCount !== COUNT
    || worksheet.diagramCount !== COUNT * 2
    || worksheet.matchingTargetCount !== worksheet.diagramCount
    || JSON.stringify(worksheet.targetElements) !== JSON.stringify([targetElement])
    || duplicates !== 0
    || worksheet.overflow !== 0
  ) {
    throw new Error(`P05F18_WORKSHEET_${targetElement}:${JSON.stringify({ ...worksheet, duplicates })}`);
  }

  return { ...worksheet, duplicates };
}

try {
  await startLocalSite();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => requestFailures.push(request.url()));

  const url = new URL(base);
  url.searchParams.set("p05f18", String(Date.now()));
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P05F18_MAIN_HTTP:${response?.status() ?? "none"}`);

  await page.waitForFunction(
    () => [...document.querySelectorAll("#batch-a-grade-select option")].some((option) => option.value === "5"),
    null,
    { timeout: 120000 },
  );
  await page.selectOption("#batch-a-grade-select", "5");
  await page.selectOption("#batch-a-semester-select", "upper");
  await page.waitForFunction(
    (sourceId) => [...document.querySelectorAll("#batch-a-source-select option")].some((option) => option.value === sourceId),
    SOURCE,
    { timeout: 120000 },
  );
  await page.selectOption("#batch-a-source-select", SOURCE);
  await page.selectOption("#batch-a-selection-mode-select", "singleKnowledgePoint");

  const selector = await page.evaluate(() => ({
    summary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
  }));
  if (
    !selector.summary.includes("可選知識點：3")
    || !selector.summary.includes("尚未開放：2")
    || !selector.summary.includes("不可選：2")
    || !selector.summary.includes("全部可選：334")
  ) {
    throw new Error(`P05F18_SELECTOR:${JSON.stringify(selector)}`);
  }

  const edgeWorksheet = await generateAndRead(page, EDGE, "EDGE", "p05f18-classic-edge");
  const faceWorksheet = await generateAndRead(page, FACE, "FACE", "p05f18-classic-face");

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("P05F18_PRINT_FRAME_MISSING");
  await frame.evaluate(() => {
    window.__P05F18_PRINT__ = 0;
    window.print = () => { window.__P05F18_PRINT__ += 1; };
  });
  await page.locator("#print-button").click();
  const printInvocations = await frame.evaluate(() => window.__P05F18_PRINT__ ?? 0);
  if (printInvocations !== 1) throw new Error(`P05F18_PRINT:${printInvocations}`);

  if (consoleErrors.length || pageErrors.length || requestFailures.length) {
    throw new Error(`P05F18_BROWSER:${JSON.stringify({ consoleErrors, pageErrors, requestFailures })}`);
  }

  const report = {
    schemaName: "P05FW5Q018ClassicUIAcceptanceV1",
    taskId: "P05F_W5DirectProductVerticalSlice018Implementation",
    status: "PASS_Q018_CLASSIC_UI_EDGE_FACE_TARGET_SEMANTICS",
    sourceId: SOURCE,
    knowledgePointIds: [EDGE, FACE],
    selector,
    edge: {
      questionCount: edgeWorksheet.questionCount,
      answerCount: edgeWorksheet.answerCount,
      targetElements: edgeWorksheet.targetElements,
      duplicates: edgeWorksheet.duplicates,
      overflow: edgeWorksheet.overflow,
    },
    face: {
      questionCount: faceWorksheet.questionCount,
      answerCount: faceWorksheet.answerCount,
      targetElements: faceWorksheet.targetElements,
      duplicates: faceWorksheet.duplicates,
      overflow: faceWorksheet.overflow,
    },
    print: { invocationCount: printInvocations },
    scopeGuard: {
      q008SourceUnitOwnershipTouched: false,
      existingElementIdentityCountTargetTouched: false,
      netTouched: false,
      broaderSpatialReasoningTouched: false,
      applicationContextTouched: false,
      geometryFormulaOrMeasurementTouched: false,
      q019OrLaterTouched: false,
    },
  };

  writeFileSync(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P05F18_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
}
