import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(directory, "run-g4b-u04-r1-deployed-pages-smoke.mjs");
const runtimePath = resolve(directory, ".run-g4b-u04-r1-deployed-pages-smoke-runtime.mjs");
const reloadLine = '  await page.reload({ waitUntil: "networkidle", timeout: 120000 });';
const replayWait = `${reloadLine}\n  await page.waitForFunction(\n    (sourceId) => document.querySelector("#batch-a-source-select")?.value === sourceId,\n    SOURCE_ID,\n    { timeout: 120000 },\n  );\n  await page.waitForFunction(\n    () => document.querySelector("#batch-a-selection-mode-select")?.value === "mixedKnowledgePointsSameUnit",\n    null,\n    { timeout: 120000 },\n  );`;

const source = await readFile(sourcePath, "utf8");
const matches = source.split(reloadLine).length - 1;
if (matches !== 1) {
  throw new Error(`G4B_U04_R1_RELOAD_PATCH_ANCHOR_MISMATCH:${matches}`);
}
await writeFile(runtimePath, source.replace(reloadLine, replayWait), "utf8");
try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
} finally {
  await rm(runtimePath, { force: true });
}
