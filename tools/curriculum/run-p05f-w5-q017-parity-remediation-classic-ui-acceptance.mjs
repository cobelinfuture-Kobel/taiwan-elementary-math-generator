import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createStaticPreviewServer } from "../preview/serve-preview.js";

const SOURCE = "g5a_u10_5a10a";
const KP = "kp_g5a_u10a_solid_cross_section";
const COUNT = 24;
const SEED = "p05f17r-classic-ui";
const OUT = path.resolve("tmp/p05f-w5-q017-parity-remediation-classic-ui");
const EXPECTED_SOLID_CUT_PAIRS = Object.freeze([
  "PRISM:PARALLEL_BASE",
  "PRISM:PERPENDICULAR_BASE",
  "PYRAMID:PARALLEL_BASE",
  "PYRAMID:THROUGH_APEX",
  "SPHERE:PLANE",
]);

mkdirSync(OUT, { recursive: true });

let base = process.env.P05F17R_SITE_URL ?? null;
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
  if (!address || typeof address === "string") {
    throw new Error("P05F17R_LOCAL_SITE_ADDRESS_INVALID");
  }
  base = `http://127.0.0.1:${address.port}/index.html`;
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
  url.searchParams.set("p05f17r", String(Date.now()));
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 120000 });
  if (!response?.ok()) throw new Error(`P05F17R_MAIN_HTTP:${response?.status() ?? "none"}`);

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
  await page.waitForFunction(
    (knowledgePointId) => Boolean(document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)),
    KP,
    { timeout: 120000 },
  );
  await page.locator(`[data-knowledge-point-id="${KP}"]`).click();
  await page.waitForFunction(
    (knowledgePointId) => document.querySelector(`[data-knowledge-point-id="${knowledgePointId}"]`)?.dataset?.selected === "true",
    KP,
    { timeout: 120000 },
  );

  await page.fill("#batch-a-question-count-input", String(COUNT));
  await page.dispatchEvent("#batch-a-question-count-input", "change");
  await page.fill("#generation-seed-input", SEED);
  await page.dispatchEvent("#generation-seed-input", "change");
  await page.check("#batch-a-answer-key-input");
  await page.fill("#columns-input", "2");
  await page.dispatchEvent("#columns-input", "change");
  await page.fill("#rows-per-page-input", "4");
  await page.dispatchEvent("#rows-per-page-input", "change");

  const selector = await page.evaluate(() => ({
    summary: document.querySelector("#batch-a-knowledge-point-availability-summary")?.textContent?.trim() ?? "",
    selected: [...document.querySelectorAll("[data-knowledge-point-id][data-selected='true']")]
      .map((node) => node.dataset.knowledgePointId),
  }));

  if (
    selector.selected.join(",") !== KP
    || !selector.summary.includes("可選知識點：3")
    || !selector.summary.includes("尚未開放：2")
    || !selector.summary.includes("不可選：2")
    || !selector.summary.includes("全部可選：332")
  ) {
    throw new Error(`P05F17R_SELECTOR:${JSON.stringify(selector)}`);
  }

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
    throw new Error(`P05F17R_GENERATION:${JSON.stringify(status)}`);
  }

  const frameElement = await page.locator("#preview-frame").elementHandle();
  const frame = await frameElement?.contentFrame();
  if (!frame) throw new Error("P05F17R_FRAME_MISSING");
  await frame.waitForSelector(".worksheet-document", { timeout: 120000 });

  const worksheet = await frame.evaluate(() => {
    const questions = [...document.querySelectorAll(".worksheet-cell--question")];
    const answers = [...document.querySelectorAll(".worksheet-cell--answer-key")];
    const pages = [...document.querySelectorAll(".worksheet-page")];
    const representations = [...document.querySelectorAll('[data-representation-mode="solid-cross-section"]')];
    return {
      questionCount: questions.length,
      answerCount: answers.length,
      diagramCount: document.querySelectorAll(".worksheet-solid-cross-section-diagram").length,
      solidKinds: [...new Set(representations.map((node) => node.dataset.solidKind))].sort(),
      cutModes: [...new Set(representations.map((node) => node.dataset.cutMode))].sort(),
      solidCutPairs: [...new Set(representations.map((node) => `${node.dataset.solidKind}:${node.dataset.cutMode}`))].sort(),
      answers: answers.map((node) => node.querySelector(".worksheet-cell__answer")?.textContent?.trim() ?? ""),
      signatures: questions.map((node) => `${node.querySelector(".worksheet-cell__prompt")?.textContent ?? ""}::${node.querySelector("svg")?.outerHTML ?? ""}`),
      overflow: pages.filter((node) => node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1).length,
    };
  });

  const duplicates = worksheet.signatures.length - new Set(worksheet.signatures).size;
  const answerSet = new Set(worksheet.answers);
  if (
    worksheet.questionCount !== COUNT
    || worksheet.answerCount !== COUNT
    || worksheet.diagramCount !== COUNT * 2
    || JSON.stringify(worksheet.solidKinds) !== JSON.stringify(["PRISM", "PYRAMID", "SPHERE"])
    || JSON.stringify(worksheet.cutModes) !== JSON.stringify(["PARALLEL_BASE", "PERPENDICULAR_BASE", "PLANE", "THROUGH_APEX"])
    || JSON.stringify(worksheet.solidCutPairs) !== JSON.stringify(EXPECTED_SOLID_CUT_PAIRS)
    || !answerSet.has("圓形")
    || !answerSet.has("長方形")
    || !answerSet.has("三角形")
    || duplicates !== 0
    || worksheet.overflow !== 0
  ) {
    throw new Error(`P05F17R_WORKSHEET:${JSON.stringify({
      questionCount: worksheet.questionCount,
      answerCount: worksheet.answerCount,
      diagramCount: worksheet.diagramCount,
      solidKinds: worksheet.solidKinds,
      cutModes: worksheet.cutModes,
      solidCutPairs: worksheet.solidCutPairs,
      duplicates,
      overflow: worksheet.overflow,
      answers: [...answerSet],
    })}`);
  }

  await frame.evaluate(() => {
    window.__P05F17R_PRINT__ = 0;
    window.print = () => {
      window.__P05F17R_PRINT__ += 1;
    };
  });
  await page.locator("#print-button").click();
  const printInvocations = await frame.evaluate(() => window.__P05F17R_PRINT__ ?? 0);
  if (printInvocations !== 1) throw new Error(`P05F17R_PRINT:${printInvocations}`);

  if (consoleErrors.length || pageErrors.length || requestFailures.length) {
    throw new Error(`P05F17R_BROWSER:${JSON.stringify({ consoleErrors, pageErrors, requestFailures })}`);
  }

  const report = {
    schemaName: "P05FW5Q017ParityRemediationClassicUIAcceptanceV1",
    taskId: "P05F_W5_Q017_FrozenQueueParityRemediation_Implementation",
    status: "PASS_Q017_PARITY_REMEDIATION_CLASSIC_UI",
    sourceId: SOURCE,
    knowledgePointId: KP,
    selector,
    worksheet: {
      questionCount: worksheet.questionCount,
      answerCount: worksheet.answerCount,
      diagramCount: worksheet.diagramCount,
      solidKinds: worksheet.solidKinds,
      cutModes: worksheet.cutModes,
      solidCutPairs: worksheet.solidCutPairs,
      duplicates,
      overflow: worksheet.overflow,
    },
    print: { invocationCount: printInvocations },
    scopeGuard: {
      q007SourceUnitOwnershipTouched: false,
      prismPyramidElementsRewritten: false,
      solidNetCorrespondenceTouched: false,
      solidViewpointRepresentationTouched: false,
      applicationContextTouched: false,
      geometryFormulaOrMeasurementTouched: false,
      q018OrLaterTouched: false,
    },
  };

  writeFileSync(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`P05F17R_CLASSIC_UI_ACCEPTANCE=${JSON.stringify(report)}`);
} finally {
  if (browser) await browser.close();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
}
