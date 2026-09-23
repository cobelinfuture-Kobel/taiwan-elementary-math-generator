import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const LIVE_PREVIEW_PATH = new URL("../../site/pixel/pixel-live-preview.js", import.meta.url);
const PREVIEW_CONTROLLER_PATH = new URL("../../site/pixel/pixel-preview-controller.js", import.meta.url);

test("Pixel public page exposes a real worksheet preview iframe", async () => {
  const html = await readFile(INDEX_PATH, "utf8");
  assert.match(html, /id="pixel-preview-frame"/);
  assert.match(html, /id="pixel-preview-frame-wrap"/);
  assert.match(html, /id="pixel-preview-empty"/);
  assert.match(html, /src="\.\/pixel-live-preview\.js"/);
  assert.doesNotMatch(html, /class="pixel-sample-list"/);
  assert.match(html, /Preview \/ Print：已接入/);
});

test("Pixel live preview subscribes to shared generation results and renders the shared iframe", async () => {
  const livePreview = await readFile(LIVE_PREVIEW_PATH, "utf8");
  const previewController = await readFile(PREVIEW_CONTROLLER_PATH, "utf8");
  assert.match(livePreview, /subscribePixelGeneration/);
  assert.match(livePreview, /renderPixelWorksheetPreview/);
  assert.match(livePreview, /pixelPreviewWorksheetId/);
  assert.match(previewController, /renderPreviewFrame/);
  assert.match(previewController, /\.\.\/assets\/styles\/print-styles\.css/);
});
