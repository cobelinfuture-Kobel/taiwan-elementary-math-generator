import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const printStyles = readFileSync(new URL(
  "../../site/assets/styles/print-styles.css",
  import.meta.url
), "utf8");

test("S57F7 print CSS removes inter-section and trailing blank pages without changing A4 page breaks", () => {
  assert.match(printStyles, /\.worksheet-section--answer-key\s*\{[\s\S]*page-break-before:\s*always;[\s\S]*break-before:\s*page;/);
  assert.match(printStyles, /\.worksheet-section\s*>\s*\.worksheet-page:last-child\s*\{[\s\S]*page-break-after:\s*auto;[\s\S]*break-after:\s*auto;/);
  assert.match(printStyles, /\.worksheet-page\s*\{[\s\S]*page-break-after:\s*always;[\s\S]*break-after:\s*page;/);
  assert.match(printStyles, /@page\s*\{[\s\S]*size:\s*A4;[\s\S]*margin:\s*0;/);
});
