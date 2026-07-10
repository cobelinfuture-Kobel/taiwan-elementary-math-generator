import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listPixelGrades,
  listPixelSemestersForGrade,
  listPixelSourceOptions,
  listPixelSourceOptionsByFilter
} from "../../site/pixel/pixel-registry-bridge.js";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SITE_ROOT = resolve(REPO_ROOT, "site");
const PAGES_WORKFLOW = resolve(REPO_ROOT, ".github/workflows/pages.yml");
const CLASSIC_INDEX = resolve(SITE_ROOT, "index.html");
const FALLBACK_INDEX = resolve(SITE_ROOT, "404.html");
const PIXEL_INDEX = resolve(SITE_ROOT, "pixel/index.html");
const MODULE_ENTRY_FILES = Object.freeze([
  resolve(SITE_ROOT, "assets/browser/main.js"),
  resolve(SITE_ROOT, "pixel/pixel-ui.js"),
  resolve(SITE_ROOT, "pixel/pixel-live-preview.js"),
  resolve(SITE_ROOT, "pixel/pixel-print-surface.js")
]);

function stripQueryAndHash(reference) {
  return reference.split("#", 1)[0].split("?", 1)[0];
}

function isExternalReference(reference) {
  return /^(?:[a-z]+:|\/\/|#)/i.test(reference);
}

function assertInsideSite(targetPath, label) {
  const rel = relative(SITE_ROOT, targetPath);
  assert.equal(rel.startsWith("..") || isAbsolute(rel), false, `${label} escapes site/: ${targetPath}`);
}

async function assertExistingLocalReference(baseFile, reference, label) {
  if (!reference || isExternalReference(reference)) return;
  assert.equal(reference.startsWith("/"), false, `${label} must remain project-pages relative: ${reference}`);
  const clean = stripQueryAndHash(reference);
  if (!clean) return;
  const targetPath = resolve(dirname(baseFile), clean);
  assertInsideSite(targetPath, label);
  const info = await stat(targetPath);
  if (info.isDirectory()) {
    await access(resolve(targetPath, "index.html"));
  }
}

function extractHtmlReferences(html) {
  return [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function extractCssReferences(css) {
  return [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1]);
}

function extractModuleSpecifiers(source) {
  const specifiers = new Set();
  for (const pattern of [
    /\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g
  ]) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }
  return [...specifiers];
}

async function walkModuleGraph(entryPath, visited = new Set()) {
  const normalized = resolve(entryPath);
  if (visited.has(normalized)) return visited;
  visited.add(normalized);
  assertInsideSite(normalized, "module entry");
  await access(normalized);
  const source = await readFile(normalized, "utf8");
  const baseUrl = pathToFileURL(normalized);
  for (const specifier of extractModuleSpecifiers(source)) {
    if (!specifier.startsWith(".")) continue;
    const importedPath = fileURLToPath(new URL(specifier, baseUrl));
    assertInsideSite(importedPath, `module import ${specifier}`);
    await access(importedPath);
    if (importedPath.endsWith(".js")) await walkModuleGraph(importedPath, visited);
  }
  return visited;
}

test("GitHub Pages publishes site/ only after npm test succeeds", async () => {
  const workflow = await readFile(PAGES_WORKFLOW, "utf8");
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /deploy:\s*[\s\S]*?needs:\s*test/);
  assert.match(workflow, /uses:\s*actions\/upload-pages-artifact@v3[\s\S]*?path:\s*site/);
  assert.match(workflow, /uses:\s*actions\/deploy-pages@v4/);
});

test("Classic, fallback, and Pixel HTML references resolve inside the GitHub Pages artifact", async () => {
  const htmlFiles = [CLASSIC_INDEX, FALLBACK_INDEX, PIXEL_INDEX];
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const references = extractHtmlReferences(html);
    assert.equal(references.length > 0, true, htmlFile);
    for (const reference of references) {
      await assertExistingLocalReference(htmlFile, reference, `${relative(SITE_ROOT, htmlFile)} reference`);
    }

    for (const stylesheet of references.filter((reference) => stripQueryAndHash(reference).endsWith(".css"))) {
      const cssPath = resolve(dirname(htmlFile), stripQueryAndHash(stylesheet));
      const css = await readFile(cssPath, "utf8");
      for (const cssReference of extractCssReferences(css)) {
        await assertExistingLocalReference(cssPath, cssReference, `${relative(SITE_ROOT, cssPath)} url()`);
      }
    }
  }
});

test("Classic and Pixel routes remain valid under a repository GitHub Pages base path", () => {
  const projectBase = new URL("https://example.invalid/taiwan-elementary-math-generator/");
  const pixelBase = new URL("./pixel/", projectBase);

  assert.equal(pixelBase.pathname, "/taiwan-elementary-math-generator/pixel/");
  assert.equal(new URL("../index.html", pixelBase).pathname, "/taiwan-elementary-math-generator/index.html");
  assert.equal(
    new URL("../assets/styles/print-styles.css", pixelBase).pathname,
    "/taiwan-elementary-math-generator/assets/styles/print-styles.css"
  );
  assert.equal(new URL("./pixel/", projectBase).origin, projectBase.origin);
});

test("Classic and Pixel browser module graphs contain only existing site-local imports", async () => {
  const visited = new Set();
  for (const entry of MODULE_ENTRY_FILES) await walkModuleGraph(entry, visited);
  assert.equal(visited.size >= MODULE_ENTRY_FILES.length, true);
  assert.equal([...visited].every((entry) => entry.startsWith(SITE_ROOT)), true);
});

test("Pixel release registry exposes the same 13 Batch A sources with valid grade-semester routes", () => {
  const sharedSources = listBatchASourceUnits();
  const pixelSources = listPixelSourceOptions();
  assert.equal(sharedSources.length, 13);
  assert.equal(pixelSources.length, 13);
  assert.deepEqual(
    pixelSources.map((entry) => entry.sourceId).sort(),
    sharedSources.map((entry) => entry.sourceId).sort()
  );
  assert.equal(new Set(pixelSources.map((entry) => entry.sourceId)).size, pixelSources.length);

  const grades = listPixelGrades();
  assert.equal(grades.length > 0, true);
  for (const grade of grades) {
    const semesters = listPixelSemestersForGrade(grade);
    assert.equal(semesters.length > 0, true, `grade ${grade}`);
    for (const semester of semesters) {
      const filtered = listPixelSourceOptionsByFilter({ grade, semester });
      assert.equal(filtered.length > 0, true, `${grade}-${semester}`);
      assert.equal(filtered.every((entry) => entry.grade === grade && entry.semester === semester), true);
    }
  }

  for (const source of pixelSources) {
    const route = listPixelSourceOptionsByFilter({ grade: source.grade, semester: source.semester });
    assert.equal(route.some((entry) => entry.sourceId === source.sourceId), true, source.sourceId);
    assert.equal(Number.isInteger(source.visibleKnowledgePointCount), true, source.sourceId);
    assert.equal(source.visibleKnowledgePointCount >= 0, true, source.sourceId);
  }
});
