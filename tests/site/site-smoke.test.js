import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve("site");

test("site smoke files exist", () => {
  const files = [
    "index.html",
    "404.html",
    "assets/styles/print-styles.css",
    "modules/core/index.js",
    "modules/renderer/html-renderer.js"
  ];
  for (const file of files) assert.equal(existsSync(path.join(root, file)), true);
});
