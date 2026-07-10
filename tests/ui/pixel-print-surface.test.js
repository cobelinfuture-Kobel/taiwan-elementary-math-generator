import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const SURFACE_PATH = new URL("../../site/pixel/pixel-print-surface.js", import.meta.url);

test("Pixel public page exposes answer and print controls", async () => {
  const html = await readFile(INDEX_PATH, "utf8");
  assert.match(html, /id="pixel-answer-key"/);
  assert.match(html, /id="pixel-output-summary"/);
  assert.match(html, /id="pixel-print-button"[^>]*disabled/);
  assert.match(html, /src="\.\/pixel-print-surface\.js"/);
  assert.match(html, /Preview \/ Print：已接入/);
  assert.match(html, /S46D 答案頁與列印控制/);
});

test("Pixel print surface subscribes to generation and uses shared print controller", async () => {
  const script = await readFile(SURFACE_PATH, "utf8");
  assert.match(script, /subscribePixelGeneration/);
  assert.match(script, /printPixelWorksheet/);
  assert.match(script, /pixel-print-button/);
  assert.match(script, /pixel-output-summary/);
  assert.match(script, /pixelOutputIncludesAnswerKey/);
  assert.match(script, /markPrintStale/);
});
