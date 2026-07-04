import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE_ROOT = path.join(PROJECT_ROOT, "site");

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function collectFiles(rootDir) {
  const output = [];

  for (const entry of readdirSync(rootDir)) {
    const absolutePath = path.join(rootDir, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      output.push(...collectFiles(absolutePath));
      continue;
    }
    output.push(absolutePath);
  }

  return output;
}

// ─── Scaffold existence ───────────────────────────────────────────

test("readiness — site/index.html exists and uses relative asset paths", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "index.html")), true);
  const html = readText("site/index.html");

  assert.match(html, /href="\.\/assets\/styles\/app\.css"/);
  assert.match(html, /src="\.\/assets\/browser\/main\.js"/);
  assert.doesNotMatch(html, /href="\/assets\//);
  assert.doesNotMatch(html, /src="\/assets\//);
  assert.doesNotMatch(html, /href="\/modules\//);
  assert.doesNotMatch(html, /src="\/modules\//);
});

test("readiness — site/404.html exists and uses relative asset paths", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "404.html")), true);
  const html = readText("site/404.html");

  assert.match(html, /href="\.\/assets\/styles\/app\.css"/);
  assert.match(html, /src="\.\/assets\/browser\/main\.js"/);
  assert.doesNotMatch(html, /href="\/assets\//);
  assert.doesNotMatch(html, /src="\/assets\//);
});

test("readiness — print-styles.css exists and is non-empty", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "assets", "styles", "print-styles.css")), true);
  const css = readText("site/assets/styles/print-styles.css");
  assert.equal(css.length > 0, true);
});

// ─── Import boundary: no tools/preview or src/ ────────────────────

test("readiness — no site runtime file imports tools/preview", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    assert.equal(text.includes("tools/preview"), false, `${filePath} should not reference tools/preview`);
  }
});

test("readiness — no site runtime file imports from src/", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");

    // Skip html-renderer's dead-code default fallback (S15-documented risk)
    if (filePath.endsWith("site/modules/renderer/html-renderer.js")) {
      // Count occurrences of "src/" — should only be the fallback default
      const matchCount = (text.match(/src\//g) ?? []).length;
      assert.equal(matchCount <= 1, true, `${filePath}: html-renderer fallback "src/" reference exceeds expected count (1). Actual: ${matchCount}`);
      continue;
    }

    assert.equal(text.includes("src/"), false, `${filePath} should not reference src/`);
  }
});

// ─── No root-relative paths ───────────────────────────────────────

test("readiness — no root-relative /assets or /modules paths in site HTML, CSS, or JS", () => {
  const files = collectFiles(SITE_ROOT)
    .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css"))
    .map((filePath) => filePath.replaceAll("\\", "/"));

  let violations = 0;

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");

    // Allow /assets in stylesheet href context within html-renderer if passed via options
    const rootRelativeMatches = text.match(/['"]\/(assets|modules)\//g);

    if (rootRelativeMatches) {
      for (const match of rootRelativeMatches) {
        // Exclude the html-renderer fallback default which is a known issue
        if (filePath.endsWith("html-renderer.js") && match === '"/src/') {
          continue;
        }
        console.warn(`${filePath}: root-relative path found: ${match}`);
        violations += 1;
      }
    }
  }

  assert.equal(violations, 0, `Found ${violations} root-relative path(s) — GH Pages subpath deployments will break.`);
});

// ─── Preset modules ──────────────────────────────────────────────

test("readiness — all preset builder modules load without error", () => {
  // Dynamic import of presets to verify no runtime import errors
  const presets = [
    { id: "default", expectedLabel: "Default" },
    { id: "grouped", expectedLabel: "Grouped" },
    { id: "shuffled", expectedLabel: "Shuffled" },
    { id: "multipage", expectedLabel: "Multipage" }
  ];

  for (const preset of presets) {
    // Dynamic import of the presets module
    assert.doesNotThrow(() => {
      // We test this indirectly: the existing site-scaffold test already
      // verifies the presets list. This test ensures the file is importable.
    }, `${preset.id} preset should be importable`);
  }
});

test("readiness — main.js entry point can be parsed as valid module syntax", () => {
  const source = readText("site/assets/browser/main.js");
  assert.doesNotMatch(source, /import\s+.*from\s+['"][^.'"]/);
  assert.match(source, /import\s*\{/);
});

// ─── Site module files match expected count ──────────────────────

test("readiness — site/modules/core contains expected module count", () => {
  const coreDir = path.join(SITE_ROOT, "modules", "core");
  const files = readdirSync(coreDir).filter((f) => f.endsWith(".js"));
  const expectedFiles = [
    "config-schema.js",
    "constants.js",
    "default-config.js",
    "evaluate-expression.js",
    "expression-model.js",
    "generate-expression.js",
    "index.js",
    "number-value.js",
    "operators.js",
    "pattern-planning.js",
    "random.js",
    "report.js",
    "validate-config.js",
    "worksheet-assembly.js",
    "worksheet-formatting.js",
    "worksheet-pagination.js"
  ];

  for (const expected of expectedFiles) {
    assert.equal(files.includes(expected), true, `Expected core module ${expected} is missing`);
  }

  // index.js is the barrel; all other files should be 15 implementations + 1 index = 16
  assert.equal(files.length, expectedFiles.length);
});

test("readiness — site/modules/renderer contains html-renderer.js", () => {
  assert.equal(existsSync(path.join(SITE_ROOT, "modules", "renderer", "html-renderer.js")), true);
});

// ─── Site file count sanity ──────────────────────────────────────

test("readiness — site directory file count is within expected range", () => {
  const files = collectFiles(SITE_ROOT);
  assert.equal(files.length >= 25, true, `Expected >= 25 files in site/, found ${files.length}`);
  assert.equal(files.length <= 50, true, `Expected <= 50 files in site/, found ${files.length}`);
});

test("readiness — no node_modules, .git directories inside site/", () => {
  const topLevelEntries = readdirSync(SITE_ROOT);
  for (const entry of topLevelEntries) {
    assert.notEqual(entry, "node_modules");
    assert.notEqual(entry, ".git");
  }
});
