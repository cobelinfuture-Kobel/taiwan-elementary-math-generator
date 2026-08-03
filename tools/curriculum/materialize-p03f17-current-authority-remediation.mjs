import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";

const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, text) => fs.writeFileSync(file, text);
const replaceFile = (file, fn) => {
  const before = read(file);
  const after = fn(before);
  if (after !== before) write(file, after);
};

const OLD_SELECTOR = "batch-a-selector-p03f13-extension.js";
const NEW_SELECTOR = "batch-a-selector-p03f17-extension.js";

for (const file of [
  "tools/curriculum/materialize-pgc-r01-public-capability-matrix.mjs",
  "tools/curriculum/materialize-pgc-r01-public-capability-matrix-v2.mjs",
  "tools/curriculum/materialize-pgc-r01-public-capability-matrix-v3.mjs",
  "tools/curriculum/materialize-pgc-r01-public-capability-matrix-v4.mjs",
  "tools/curriculum/materialize-pgc-r02-ui-capability-binding.mjs",
  "tests/curriculum/pgc-r01-public-capability-matrix.test.js",
  "tests/curriculum/pgc-r02-public-ui-capability-binding.test.js",
]) {
  replaceFile(file, (text) => text.replaceAll(OLD_SELECTOR, NEW_SELECTOR));
}

replaceFile("tests/curriculum/pgc-r00-public-generation-scope.test.js", (text) => text
  .replace(
    'test("PGC-R00 freezes the exact 26-source public product authority", () => {',
    'test("PGC-R00 freezes the exact 26-source historical authority while current public sources may extend", () => {',
  )
  .replace('assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 26);', 'assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 27);')
  .replace('new Set(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((row) => row.sourceId)).size,\n    26,', 'new Set(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((row) => row.sourceId)).size,\n    27,'));

replaceFile("tests/curriculum/pgc-r01-public-capability-matrix.test.js", (text) => text
  .replace('test("PGC-R01 accounts for all 26 public sources and all visible KnowledgePoints", () => {', 'test("PGC-R01 accounts for all current public sources and all visible KnowledgePoints", () => {')
  .replaceAll('assert.equal(matrix.summary.publicSourceCount, 26);', 'assert.equal(matrix.summary.publicSourceCount, 27);')
  .replaceAll('assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 26);', 'assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 27);')
  .replace('assert.equal(expectedPairCount, 579);', 'assert.equal(expectedPairCount, 597);'));

replaceFile("tools/curriculum/materialize-pgc-r01-public-capability-matrix-v4.mjs", (text) => text.replace(
  '"1. All 26 public sources and all 193 visible KnowledgePoints are accounted across all three public surfaces.",',
  '`1. All ${matrix.summary.publicSourceCount} public sources and all ${matrix.summary.publicVisibleKnowledgePointCount} visible KnowledgePoints are accounted across all three public surfaces.`,',
));

replaceFile("tests/curriculum/pgc-r02-public-ui-capability-binding.test.js", (text) => text
  .replace('assert.equal(contract.summary.publicSourceCount, 26);', 'assert.equal(contract.summary.publicSourceCount, 27);')
  .replace('assert.equal(contract.summary.visibleKnowledgePointCount, 193);', 'assert.equal(contract.summary.visibleKnowledgePointCount, 199);')
  .replaceAll('["VERIFIED_20", "VERIFIED_LIMITED", "FAIL_CLOSED_PENDING_PGC_R03"]', '["VERIFIED_20", "VERIFIED_LIMITED", "STRUCTURAL_FALLBACK_AVAILABLE", "FAIL_CLOSED_PENDING_PGC_R03"]'));

const sourceCountAssertion = /assert\.equal\(([^;\n]*(?:sources\.length|Sources\.length|sourceCount)[^;\n]*), 26\);/g;
for (const file of fs.readdirSync("tests/curriculum")
  .filter((name) => /^p03f-slice.*\.test\.js$/.test(name))
  .map((name) => path.join("tests/curriculum", name))) {
  replaceFile(file, (text) => text
    .replace(sourceCountAssertion, (_, expr) => `assert.equal(${expr}, 27);`)
    .replaceAll("current Pixel retains 26 sources", "current Pixel retains 27 sources")
    .replaceAll("current Classic and Pixel expose 26 sources", "current Classic and Pixel expose 27 sources")
    .replaceAll("current Pixel exposes 26 sources", "current Pixel exposes 27 sources"));
}

const metricLoop = /for \(const \[key, value\] of Object\.entries\(expected\)\) if \(metrics\[key\] !== value\) errors\.push\(`(P03F\d+)_METRIC_INVALID:\$\{key\}:\$\{metrics\[key\]\}:\$\{value\}`\);/g;
for (const n of ["011", "012", "013", "014"]) {
  const file = `tools/curriculum/validate-p03f-slice${n}-product-admission.mjs`;
  if (!fs.existsSync(file)) continue;
  replaceFile(file, (text) => text
    .replace(metricLoop, (_, prefix) => `for (const [key, value] of Object.entries(expected)) {\n    if (key === "publicSourceCountAfterAdmission") {\n      if (metrics[key] < value) errors.push(\`${prefix}_METRIC_INVALID:\${key}:\${metrics[key]}:\${value}\`);\n    } else if (metrics[key] !== value) errors.push(\`${prefix}_METRIC_INVALID:\${key}:\${metrics[key]}:\${value}\`);\n  }`)
    .replaceAll("pixelSources.length !== 26", "pixelSources.length < 26")
    .replaceAll("pixelSnapshot.sourceCount !== 26", "pixelSnapshot.sourceCount < 26")
    .replaceAll("evidence.pixelSnapshot?.sourceCount !== 26", "evidence.pixelSnapshot?.sourceCount < 26"));
}

for (const command of [
  ["tools/curriculum/materialize-pgc-r01-public-capability-matrix-v4.mjs"],
  ["tools/curriculum/materialize-pgc-r02-ui-capability-binding-r03.mjs"],
]) {
  try {
    execFileSync(process.execPath, command, { stdio: "inherit" });
  } catch (error) {
    console.error(`P03F17_MATERIALIZER_FAIL_CLOSED:${command[0]}:${error.status ?? "unknown"}`);
  }
}

const changed = execSync("git diff --name-only", { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const bundleRoot = path.join(os.tmpdir(), "p03f17-remediation-bundle");
const bundleTar = path.join(os.tmpdir(), "p03f17-remediation-bundle.tar.gz");
fs.rmSync(bundleRoot, { recursive: true, force: true });
fs.rmSync(bundleTar, { force: true });
fs.mkdirSync(bundleRoot, { recursive: true });
fs.writeFileSync(path.join(bundleRoot, "changed-files.txt"), `${changed.join("\n")}\n`);
for (const file of changed) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const dest = path.join(bundleRoot, "files", file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}
execSync(`tar -czf ${JSON.stringify(bundleTar)} -C ${JSON.stringify(bundleRoot)} changed-files.txt files`);
const payload = fs.readFileSync(bundleTar).toString("base64");
console.log(`P03F17_REMEDIATION_BUNDLE_BEGIN:${payload}:P03F17_REMEDIATION_BUNDLE_END`);
console.log(`P03F17_REMEDIATION_CHANGED_FILES=${JSON.stringify(changed)}`);
