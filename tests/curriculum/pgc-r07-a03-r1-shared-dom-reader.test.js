import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  patchPGCR07A03Runner,
} from "../../tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix-r1.mjs";

const baseRunner = readFileSync(
  new URL("../../tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix.mjs", import.meta.url),
  "utf8",
);

test("PGC-R07 A03 R1 waits for a materialized worksheet before identity extraction", () => {
  const patched = patchPGCR07A03Runner(baseRunner);
  assert.match(patched, /\.g5a-u08-cell--question, \.worksheet-cell--question, \.g4b-u04-cell--question/);
  assert.match(patched, /first\(\)\.waitFor\(\{ state: "visible", timeout: 120000 \}\)/);
});

test("PGC-R07 A03 R1 reads dedicated and shared renderer DOM without changing parity rules", () => {
  const patched = patchPGCR07A03Runner(baseRunner);
  assert.match(patched, /\.worksheet-cell--answer-key/);
  assert.match(patched, /\.g4b-u04-cell--answer/);
  assert.match(patched, /PGC_R07_A03_CROSS_SURFACE_QUESTION_IDENTITY_DRIFT/);
  assert.match(patched, /PGC_R07_A03_CROSS_SURFACE_ANSWER_IDENTITY_DRIFT/);
  assert.match(patched, /await printPage\.pdf\(/);
});
