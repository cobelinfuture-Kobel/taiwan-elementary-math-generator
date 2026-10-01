import assert from "node:assert/strict";
import { chromium } from "playwright";

const liveUrl =
  "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/exam-template/";
const cacheBuster = `g06M5Live=${Date.now()}`;
const url = liveUrl + "?" + cacheBuster;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) =>
    pageErrors.push(error?.stack ?? error?.message ?? String(error)),
  );
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  assert.ok(response, "LIVE_PAGE_NO_RESPONSE");
  assert.equal(response.status(), 200, `LIVE_PAGE_HTTP_${response.status()}`);

  await page.waitForFunction(
    () => {
      const grade = document.querySelector("#exam-grade");
      const semester = document.querySelector("#exam-semester");
      const source = document.querySelector("#exam-source");
      const help = document.querySelector("#exam-source-help");
      return (
        (grade?.options?.length ?? 0) > 1 &&
        (semester?.options?.length ?? 0) > 1 &&
        (source?.options?.length ?? 0) > 1 &&
        (help?.textContent?.trim() ?? "") !== "正在讀取可用單元..."
      );
    },
    undefined,
    { timeout: 30000 },
  );

  const snapshot = await page.evaluate(() => {
    const options = (selector) =>
      Array.from(document.querySelector(selector)?.options ?? []).map((option) => ({
        value: option.value,
        text: option.textContent?.trim() ?? "",
      }));

    return {
      href: location.href,
      gradeOptions: options("#exam-grade"),
      semesterOptions: options("#exam-semester"),
      sourceOptions: options("#exam-source"),
      sourceHelp:
        document.querySelector("#exam-source-help")?.textContent?.trim() ?? "",
      compositionMode:
        document.querySelector("#exam-composition-mode")?.value ?? "",
      status: document.querySelector("#exam-status")?.textContent?.trim() ?? "",
    };
  });

  console.log("G06_M5_LIVE_BROWSER_SNAPSHOT=" + JSON.stringify(snapshot));
  console.log("G06_M5_LIVE_PAGE_ERRORS=" + JSON.stringify(pageErrors));
  console.log("G06_M5_LIVE_CONSOLE_ERRORS=" + JSON.stringify(consoleErrors));

  assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(" | ")}`);
  assert.equal(
    consoleErrors.length,
    0,
    `console errors: ${consoleErrors.join(" | ")}`,
  );
  assert.ok(snapshot.gradeOptions.length > 1, JSON.stringify(snapshot));
  assert.ok(snapshot.semesterOptions.length > 1, JSON.stringify(snapshot));
  assert.ok(snapshot.sourceOptions.length > 1, JSON.stringify(snapshot));
  assert.notEqual(
    snapshot.sourceHelp,
    "正在讀取可用單元...",
    JSON.stringify(snapshot),
  );
  assert.equal(snapshot.compositionMode, "SINGLE_UNIT", JSON.stringify(snapshot));
} finally {
  if (browser) await browser.close();
}
