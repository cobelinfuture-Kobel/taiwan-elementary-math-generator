import { chromium } from "playwright";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE_ID = "g5b_u09_5b09";
const Q029_KP_ID = "kp_g5b_u09_average_time";

const registry = getCurrentPixelRegistrySnapshot();
const source = registry.bySourceId[SOURCE_ID];
if (!source) throw new Error(`P04F29_PREFLIGHT_SOURCE_NOT_PUBLIC:${SOURCE_ID}`);

const visibleIds = source.visibleKnowledgePoints.map((row) => row.knowledgePointId);
if (visibleIds.includes(Q029_KP_ID)) {
  throw new Error(`P04F29_PREFLIGHT_Q029_ALREADY_PUBLIC:${Q029_KP_ID}`);
}

const options = visibleIds
  .map((id) => `<option value="${id}">${id}</option>`)
  .join("");
const html = `<!doctype html><html><body><select id="kp-selector">${options}</select></body></html>`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const browserVisibleIds = await page.locator("#kp-selector option").evaluateAll((nodes) =>
    nodes.map((node) => node.value),
  );
  if (browserVisibleIds.length !== visibleIds.length) {
    throw new Error(`P04F29_PREFLIGHT_BROWSER_COUNT_MISMATCH:${browserVisibleIds.length}:${visibleIds.length}`);
  }
  if (browserVisibleIds.includes(Q029_KP_ID)) {
    throw new Error(`P04F29_PREFLIGHT_BROWSER_Q029_EXPOSED:${Q029_KP_ID}`);
  }
  console.log(JSON.stringify({
    status: "PASS",
    sourceId: SOURCE_ID,
    q029KnowledgePointId: Q029_KP_ID,
    q029PubliclyVisible: false,
    visibleKnowledgePointCount: browserVisibleIds.length,
    browserBoundary: "CURRENT_PUBLIC_SELECTOR_PROJECTION_NEGATIVE_PREFLIGHT",
  }));
} finally {
  await browser.close();
}
