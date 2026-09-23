import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../src/renderer/print-styles.css", import.meta.url), "utf8");

test("S43E5 R4M print CSS avoids trailing blank pages", () => {
  assert.equal(css.includes("page-break-after: always"), false);
  assert.equal(css.includes("break-after: page"), false);
  assert.equal(css.includes("page-break-after: auto"), true);
  assert.equal(css.includes("break-after: auto"), true);
});

test("S43E5 R4M print CSS starts answer key on a new page without section gaps", () => {
  assert.match(css, /\.worksheet-document,\s*\.worksheet-section\s*\{[^}]*display:\s*block;[^}]*gap:\s*0;/s);
  assert.match(css, /\.worksheet-section--answer-key\s*\{[^}]*page-break-before:\s*always;[^}]*break-before:\s*page;/s);
  assert.match(css, /\.worksheet-page \+ \.worksheet-page\s*\{[^}]*page-break-before:\s*always;[^}]*break-before:\s*page;/s);
});
