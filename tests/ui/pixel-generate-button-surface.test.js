import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const UI_PATH = new URL("../../site/pixel/pixel-ui.js", import.meta.url);

test("Pixel public page enables generate button and exposes generation status regions", async () => {
  const html = await readFile(INDEX_PATH, "utf8");
  assert.match(html, /id="pixel-generate-button"/);
  assert.doesNotMatch(html, /id="pixel-generate-button"[^>]*disabled/);
  assert.match(html, /id="pixel-generation-status"/);
  assert.match(html, /id="pixel-generation-errors"/);
  assert.match(html, /共用 Generator \/ Validator/);
  assert.match(html, /Live Preview：已接入/);
});

test("Pixel UI imports controller and binds generate button to shared execution", async () => {
  const script = await readFile(UI_PATH, "utf8");
  assert.match(script, /runPixelWorksheetGeneration/);
  assert.match(script, /generateButton\?\.addEventListener\("click", generateWorksheet\)/);
  assert.match(script, /pixelGeneratedWorksheetId/);
  assert.match(script, /pixelGeneratedQuestionCount/);
});
