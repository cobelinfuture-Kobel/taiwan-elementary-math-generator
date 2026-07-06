import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const SITE_ROOT = path.resolve("site");

function collectFiles(root, prefix = "") {
  const entries = readdirSync(root);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry);
    const relativePath = prefix ? `${prefix}/${entry}` : entry;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

test("readiness — site root exists", () => {
  assert.equal(existsSync(SITE_ROOT), true);
});

test("readiness — site/modules/core contains expected modules", () => {
  const coreRoot = path.join(SITE_ROOT, "modules", "core");
  const files = readdirSync(coreRoot).filter((file) => file.endsWith(".js")).sort();
  const expectedFiles = [
    "constants.js",
    "display-model.js",
    "evaluate-expression.js",
    "expression-formatting.js",
    "expression-model.js",
    "generate-expression.js",
    "index.js",
    "number-formatting.js",
    "number-value.js",
    "pattern-planning.js",
    "random.js",
    "validation-result.js",
    "validator.js",
    "worksheet-document.js",
    "worksheet-formatting.js",
    "worksheet-pagination.js"
  ];

  for (const expected of expectedFiles) {
    assert.equal(files.includes(expected), true, `Expected core module ${expected} is missing`);
  }

  assert.equal(files.length, expectedFiles.length);
});

test("readiness — site/modules/renderer contains html-renderer.js", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "modules", "renderer", "html-renderer.js")), true);
});

test("readiness — site directory file count is within expected range", () => {
  const files = collectFiles(SITE_ROOT);
  assert.equal(files.length >= 25, true, `Expected >= 25 files in site/, found ${files.length}`);
  assert.equal(files.length <= 51, true, `Expected <= 51 files in site/, found ${files.length}`);
});

test("readiness — no node_modules, .git directories inside site/", () => {
  const topLevelEntries = readdirSync(SITE_ROOT);
  for (const entry of topLevelEntries) {
    assert.notEqual(entry, "node_modules");
    assert.notEqual(entry, ".git");
  }
});

test("site scaffold files exist", () => {
  const requiredFiles = ["index.html", "404.html", "assets/styles/print-styles.css"];
  for (const file of requiredFiles) {
    assert.equal(existsSync(path.join(SITE_ROOT, file)), true, `Expected site scaffold file ${file} is missing`);
  }
});
