import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const INDEX_PATH = new URL("../../site/pixel/index.html", import.meta.url);
const STYLE_PATH = new URL("../../site/pixel/pixel-selector.css", import.meta.url);

test("Pixel public page clearly labels beta scope and known limits", async () => {
  const html = await readFile(INDEX_PATH, "utf8");

  assert.match(html, /data-ui-version="pixel-beta"/);
  assert.match(html, /Pixel UI Beta/);
  assert.match(html, /id="pixel-beta-notice-title"/);
  assert.match(html, /目前可用功能與已知限制/);
  assert.match(html, /id="pixel-known-limits"/);
  assert.match(html, /跨單元知識點混合尚未開放/);
  assert.match(html, /尚未通過 QA、隱藏或未發布的知識點不會出現在選單/);
  assert.match(html, /重新整理頁面後不保留設定、考卷或學生作答紀錄/);
  assert.match(html, /未列入目前公開 Registry 的單元與題型無法由 Pixel UI 選取/);
  assert.match(html, /回到標準版/);
});

test("Pixel beta notice styling is responsive and excluded from print", async () => {
  const css = await readFile(STYLE_PATH, "utf8");

  assert.match(css, /\.pixel-beta-notice\s*\{/);
  assert.match(css, /\.pixel-beta-notice__grid\s*\{/);
  assert.match(css, /\.pixel-beta-card--available\s*\{/);
  assert.match(css, /\.pixel-beta-card--limits\s*\{/);
  assert.match(css, /@media \(max-width: 920px\)[\s\S]*\.pixel-beta-notice__grid/);
  assert.match(css, /@media print[\s\S]*\.pixel-beta-notice/);
});
