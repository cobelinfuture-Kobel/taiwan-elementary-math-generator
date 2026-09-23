import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const CLASSIC_INDEX_PATH = new URL("../../site/index.html", import.meta.url);
const CLASSIC_FALLBACK_PATH = new URL("../../site/404.html", import.meta.url);
const PIXEL_INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const CLASSIC_CSS_PATH = new URL("../../site/assets/styles/app.css", import.meta.url);

test("Classic and Pixel public pages expose bidirectional version switching", async () => {
  const [classicHtml, fallbackHtml, pixelHtml] = await Promise.all([
    readFile(CLASSIC_INDEX_PATH, "utf8"),
    readFile(CLASSIC_FALLBACK_PATH, "utf8"),
    readFile(PIXEL_INDEX_PATH, "utf8")
  ]);

  assert.match(classicHtml, /aria-label="介面版本切換"/);
  assert.match(classicHtml, /href="\.\/pixel\/"/);
  assert.match(classicHtml, /切換至像素風版 Beta/);
  assert.match(classicHtml, /標準版 Classic/);

  assert.match(fallbackHtml, /href="\.\/index\.html"/);
  assert.match(fallbackHtml, /href="\.\/pixel\/"/);
  assert.match(fallbackHtml, /切換至像素風版 Beta/);

  assert.match(pixelHtml, /href="\.\.\/index\.html"/);
  assert.match(pixelHtml, /回到標準版/);
  assert.match(pixelHtml, /Classic 保留/);
});

test("Classic version switch styles provide visible and keyboard-focusable controls", async () => {
  const css = await readFile(CLASSIC_CSS_PATH, "utf8");
  assert.match(css, /\.app-shell__version-nav/);
  assert.match(css, /\.version-link/);
  assert.match(css, /\.version-chip/);
  assert.match(css, /\.version-link:focus-visible/);
});
