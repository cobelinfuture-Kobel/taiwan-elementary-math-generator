import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import process from "node:process";
import { chromium } from "playwright";

const port = 4174;
const server = spawn(process.execPath, ["tools/site/serve-site.js"], {
  env: { ...process.env, SITE_PORT: String(port), SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/exam-template/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`SITE_SERVER_NOT_READY\n${serverOutput}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error?.stack ?? error?.message ?? String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`http://127.0.0.1:${port}/exam-template/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const snapshot = await page.evaluate(() => ({
    gradeCount: document.querySelector("#exam-grade")?.options?.length ?? -1,
    semesterCount: document.querySelector("#exam-semester")?.options?.length ?? -1,
    sourceCount: document.querySelector("#exam-source")?.options?.length ?? -1,
    sourceHelp: document.querySelector("#exam-source-help")?.textContent?.trim() ?? "",
    compositionMode: document.querySelector("#exam-composition-mode")?.value ?? "",
    status: document.querySelector("#exam-status")?.textContent?.trim() ?? "",
  }));

  console.log("EXAM_TEMPLATE_BROWSER_SNAPSHOT=" + JSON.stringify(snapshot));
  console.log("EXAM_TEMPLATE_PAGE_ERRORS=" + JSON.stringify(pageErrors));
  console.log("EXAM_TEMPLATE_CONSOLE_ERRORS=" + JSON.stringify(consoleErrors));

  assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(" | ")}`);
  assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join(" | ")}`);
  assert.ok(snapshot.gradeCount > 0, JSON.stringify(snapshot));
  assert.ok(snapshot.semesterCount > 0, JSON.stringify(snapshot));
  assert.ok(snapshot.sourceCount > 0, JSON.stringify(snapshot));
  assert.notEqual(snapshot.sourceHelp, "正在讀取可用單元...", JSON.stringify(snapshot));
  assert.equal(snapshot.compositionMode, "SINGLE_UNIT", JSON.stringify(snapshot));
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
