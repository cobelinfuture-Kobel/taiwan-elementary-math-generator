import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function read(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("S77 removes visible Batch A wording from Classic, fallback and Pixel", () => {
  for (const relativePath of ["site/index.html", "site/404.html", "site/pixel/index.html"]) {
    const text = visibleText(read(relativePath));
    assert.equal(text.includes("Batch A"), false, `${relativePath} must not expose internal batch labels`);
  }
});

test("S77 installs neutral Classic and fallback labels", () => {
  for (const relativePath of ["site/index.html", "site/404.html"]) {
    const html = read(relativePath);
    assert.match(html, /<title>台灣小學數學練習題產生器<\/title>/);
    assert.match(html, /Taiwan Elementary Math Worksheet/);
    assert.match(html, /<h1>台灣小學數學練習題產生器<\/h1>/);
    assert.match(html, /<h2>單元選擇<\/h2>/);
    assert.match(html, /aria-label="練習題設定"/);
    assert.match(html, /尚未產生新的練習題。/);
  }
});

test("S77 keeps compatibility ids, query names and entry points", () => {
  for (const relativePath of ["site/index.html", "site/404.html"]) {
    const html = read(relativePath);
    assert.match(html, /id="batch-a-source-select"/);
    assert.match(html, /name="batchASourceId"/);
    assert.match(html, /id="batch-a-selection-mode-select"/);
    assert.match(html, /id="batch-a-question-count-input"/);
    assert.match(html, /value="batch-a-browser"/);
    assert.match(html, /src="\.\/assets\/browser\/main\.js"/);
  }

  const pixel = read("site/pixel/index.html");
  assert.match(pixel, /使用目前公開的單元與通過驗證的知識點。/);
  assert.match(pixel, /id="pixel-source-select"/);
  assert.match(pixel, /src="\.\/pixel-ui\.js"/);
  assert.match(pixel, /src="\.\/pixel-live-preview\.js"/);
  assert.match(pixel, /src="\.\/pixel-print-surface\.js"/);
});

test("S77 does not introduce a public Batch A or Batch B toggle", () => {
  const combined = ["site/index.html", "site/404.html", "site/pixel/index.html"]
    .map(read)
    .join("\n");
  assert.doesNotMatch(combined, /batch-toggle/i);
  assert.doesNotMatch(visibleText(combined), /Batch B/);
});
