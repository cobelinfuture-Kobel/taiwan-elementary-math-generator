import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.resolve(ROOT, "tmp/p05f-w5-q018-live-pages-e2e");
const BASE = new URL(process.env.P05F18_BASE_URL ?? "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const HEAD = process.env.GITHUB_SHA ?? "LOCAL";
const EDGE = "kp_g5a_u10a1_cube_cuboid_edge_length";
const FACE = "kp_g5a_u10a1_cube_cuboid_face_relationship";
const SOURCE = "g5a_u10_5a10a1";

mkdirSync(OUT, { recursive: true });

const ASSETS = [
  ["site/modules/curriculum/registry/g5a-u10a1-cube-cuboid-edge-face-selector-projection-p05f18.js", "modules/curriculum/registry/g5a-u10a1-cube-cuboid-edge-face-selector-projection-p05f18.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p05f18-extension.js", "modules/curriculum/registry/batch-a-selector-p05f18-extension.js"],
  ["site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js", "modules/curriculum/registry/batch-a-selector-p04f33-extension.js"],
  ["site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-edge-face-runtime-p05f18.js", "modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-edge-face-runtime-p05f18.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-generator-p05f18.js", "modules/curriculum/batch-a/batch-a-browser-generator-p05f18.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f18-extension.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-p05f18-extension.js"],
  ["site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js", "modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p05f18.js", "modules/curriculum/public/public-ui-capability-binding-p05f18.js"],
  ["site/modules/curriculum/public/public-ui-capability-binding-p04f33.js", "modules/curriculum/public/public-ui-capability-binding-p04f33.js"],
];

const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retries = Number(process.env.P05F18_DEPLOYMENT_RETRIES ?? 36);
const delay = Number(process.env.P05F18_DEPLOYMENT_RETRY_DELAY_MS ?? 15000);

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store", headers: { "cache-control": "no-cache" } });
  if (!response.ok) throw new Error(`HTTP_${response.status}:${url}`);
  return response.text();
}

async function waitForExactDeployment() {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const assets = [];
      for (const [repoPath, publicPath] of ASSETS) {
        const expected = sha256(readFileSync(path.resolve(ROOT, repoPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("q018", expected.slice(0, 16));
        const actual = sha256(await fetchText(url));
        if (actual !== expected) throw new Error(`${publicPath}:${expected}:${actual}`);
        assets.push({ repoPath, expectedSha256: expected, liveSha256: actual });
      }
      return { attempt, assets };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(delay);
    }
  }
  throw new Error(`P05F18_EXACT_DEPLOYMENT_NOT_OBSERVED:${lastError?.message}`);
}

async function directRuntimeAcceptance() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    return await page.evaluate(async ({ base, edge, face, source, head }) => {
      const runtime = await import(`${base}modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-edge-face-runtime-p05f18.js?sha=${head}`);
      const edgeGenerated = runtime.generateG5AU10A1P05F18Questions({
        selectedKnowledgePointIds: [edge],
        questionCount: 50,
        generationSeed: "live-q018-edge",
      });
      const faceGenerated = runtime.generateG5AU10A1P05F18Questions({
        selectedKnowledgePointIds: [face],
        questionCount: 50,
        generationSeed: "live-q018-face",
      });
      const edgeTampered = edgeGenerated.questions[0]
        ? { ...edgeGenerated.questions[0], geometryDiagram: { ...edgeGenerated.questions[0].geometryDiagram, targetElement: "FACE" } }
        : null;
      const faceTampered = faceGenerated.questions[0]
        ? { ...faceGenerated.questions[0], geometryDiagram: { ...faceGenerated.questions[0].geometryDiagram, targetElement: "EDGE" } }
        : null;
      return {
        source,
        edge: {
          ok: edgeGenerated.ok,
          count: edgeGenerated.questions.length,
          distinct: new Set(edgeGenerated.questions.map((question) => question.questionSignature)).size,
          targetElements: [...new Set(edgeGenerated.questions.map((question) => question.geometryDiagram.targetElement))],
          valid: edgeGenerated.questions.every((question) => runtime.validateG5AU10A1P05F18Question(question).ok),
          tamperRejected: edgeTampered ? !runtime.validateG5AU10A1P05F18Question(edgeTampered).ok : false,
        },
        face: {
          ok: faceGenerated.ok,
          count: faceGenerated.questions.length,
          distinct: new Set(faceGenerated.questions.map((question) => question.questionSignature)).size,
          targetElements: [...new Set(faceGenerated.questions.map((question) => question.geometryDiagram.targetElement))],
          valid: faceGenerated.questions.every((question) => runtime.validateG5AU10A1P05F18Question(question).ok),
          tamperRejected: faceTampered ? !runtime.validateG5AU10A1P05F18Question(faceTampered).ok : false,
        },
      };
    }, { base: BASE.href, edge: EDGE, face: FACE, source: SOURCE, head: HEAD });
  } finally {
    await page.close();
    await browser.close();
  }
}

function liveClassicUiAcceptance() {
  const site = new URL("index.html", BASE).href;
  const result = spawnSync(
    process.execPath,
    [path.resolve(ROOT, "tools/curriculum/run-p05f-w5-q018-classic-ui-acceptance.mjs")],
    {
      cwd: ROOT,
      env: { ...process.env, P05F18_SITE_URL: site },
      encoding: "utf8",
      timeout: 300000,
    },
  );
  writeFileSync(path.join(OUT, "ui.stdout.txt"), result.stdout ?? "");
  writeFileSync(path.join(OUT, "ui.stderr.txt"), result.stderr ?? "");
  if (result.status !== 0) throw new Error(`P05F18_LIVE_UI:${result.stderr || result.stdout}`);
  const line = (result.stdout ?? "").split(/\r?\n/).find((entry) => entry.startsWith("P05F18_CLASSIC_UI_ACCEPTANCE="));
  if (!line) throw new Error("P05F18_UI_REPORT_MISSING");
  return JSON.parse(line.slice("P05F18_CLASSIC_UI_ACCEPTANCE=".length));
}

const deployment = await waitForExactDeployment();
const runtime = await directRuntimeAcceptance();
if (
  runtime.source !== SOURCE
  || !runtime.edge.ok
  || runtime.edge.count !== 50
  || runtime.edge.distinct !== 50
  || !runtime.edge.valid
  || !runtime.edge.tamperRejected
  || runtime.edge.targetElements.join(",") !== "EDGE"
  || !runtime.face.ok
  || runtime.face.count !== 50
  || runtime.face.distinct !== 50
  || !runtime.face.valid
  || !runtime.face.tamperRejected
  || runtime.face.targetElements.join(",") !== "FACE"
) {
  throw new Error(`P05F18_DIRECT:${JSON.stringify(runtime)}`);
}

const ui = liveClassicUiAcceptance();
const report = {
  schemaName: "P05FW5Q018TrueFrozenSliceLivePagesE2EV1",
  taskId: "P05F_W5DirectProductVerticalSlice018Implementation",
  status: "PASS_E6_D0_COMPLETE",
  exactHeadSha: HEAD,
  queuePosition: 18,
  sourceId: SOURCE,
  knowledgePointIds: [EDGE, FACE],
  semanticContract: {
    edgeTargetElement: "EDGE",
    faceTargetElement: "FACE",
    validatorRejectsCrossTargetSemantics: true,
  },
  deployment,
  runtime,
  ui,
  scopeGuard: {
    frozenQueueAuthorityTouched: false,
    q008SourceUnitOwnershipTouched: false,
    existingElementIdentityCountTargetTouched: false,
    cubeCuboidNetTouched: false,
    broaderSpatialReasoningTouched: false,
    applicationContextTouched: false,
    geometryFormulaOrMeasurementTouched: false,
    q019OrLaterTouched: false,
  },
};
writeFileSync(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`P05F18_LIVE_PAGES_E2E=${JSON.stringify(report)}`);
