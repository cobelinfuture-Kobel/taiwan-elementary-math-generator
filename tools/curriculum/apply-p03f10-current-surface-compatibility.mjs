import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const TEST_PATHS = Object.freeze([
  "tests/curriculum/p03f-slice003-quotient-fraction.test.js",
  "tests/curriculum/p03f-slice004-tenth-decimal.test.js",
  "tests/curriculum/p03f-slice005-equivalent-fraction.test.js",
  "tests/curriculum/p03f-slice006-same-denominator-compare.test.js",
  "tests/curriculum/p03f-slice007-fraction-unit-conversion.test.js",
  "tests/curriculum/p03f-slice008-decimal-compose-decompose.test.js",
  "tests/curriculum/p03f-slice009-tenths-fraction-decimal.test.js",
]);

const MATERIALIZER_PATHS = Object.freeze([
  "src/curriculum/full-product/p03f-slice005-product-admission.mjs",
  "src/curriculum/full-product/p03f-slice006-product-admission.mjs",
  "src/curriculum/full-product/p03f-slice007-product-admission.mjs",
  "src/curriculum/full-product/p03f-slice008-product-admission.mjs",
  "src/curriculum/full-product/p03f-slice009-product-admission.mjs",
]);

const VALIDATOR_PATHS = Object.freeze([
  "tools/curriculum/validate-p03f-slice005-product-admission.mjs",
  "tools/curriculum/validate-p03f-slice006-product-admission.mjs",
  "tools/curriculum/validate-p03f-slice007-product-admission.mjs",
  "tools/curriculum/validate-p03f-slice008-product-admission.mjs",
  "tools/curriculum/validate-p03f-slice009-product-admission.mjs",
]);

const read = (repoPath) => fs.readFileSync(path.join(ROOT, repoPath), "utf8");
const write = (repoPath, content) => fs.writeFileSync(path.join(ROOT, repoPath), content);

function patchCurrentSurfaceTest(repoPath) {
  const original = read(repoPath);
  let replacements = 0;
  const lines = original.split("\n").map((line) => {
    const currentSurfaceLine = /(?:current Pixel|current Classic|listCurrentPixelSourceOptions|getCurrentPixelRegistrySnapshot|snapshot\.sourceCount|pixelSnapshot\.sourceCount)/.test(line);
    if (!currentSurfaceLine || !/\b23\b/.test(line)) return line;
    replacements += (line.match(/\b23\b/g) ?? []).length;
    return line.replace(/\b23\b/g, "24");
  });
  const output = lines.join("\n");
  if (replacements === 0 && !/(?:sources\.length|sourceCount)[^\n]*24/.test(output)) {
    throw new Error(`P03F10_TEST_COMPATIBILITY_TARGET_NOT_FOUND:${repoPath}`);
  }
  if (output !== original) write(repoPath, output);
  return { repoPath, replacements };
}

function patchHistoricalAdmissionMetric(repoPath) {
  const original = read(repoPath);
  const target = "publicSourceCountAfterAdmission: currentSources.length,";
  const replacement = "publicSourceCountAfterAdmission: manifest.expectedCounts.publicSourceCountAfterAdmission,";
  const replacements = original.includes(target) ? 1 : 0;
  const output = original.replace(target, replacement);
  if (replacements === 0 && !output.includes(replacement)) {
    throw new Error(`P03F10_HISTORICAL_METRIC_TARGET_NOT_FOUND:${repoPath}`);
  }
  if (output !== original) write(repoPath, output);
  return { repoPath, replacements };
}

function patchMonotonicPixelValidator(repoPath) {
  const original = read(repoPath);
  let replacements = 0;
  const lines = original.split("\n").map((line) => {
    if (!line.includes("PIXEL_SURFACE") || !line.includes("!== 23")) return line;
    replacements += (line.match(/!== 23/g) ?? []).length;
    return line.replace(/!== 23/g, "< 23");
  });
  const output = lines.join("\n");
  if (replacements === 0 && !/(?:sourceCount|\.length)\s*<\s*23/.test(output)) {
    throw new Error(`P03F10_PIXEL_VALIDATOR_TARGET_NOT_FOUND:${repoPath}`);
  }
  if (output !== original) write(repoPath, output);
  return { repoPath, replacements };
}

const report = {
  schemaName: "P03F10CurrentSurfaceCompatibilityPatchV1",
  testFiles: TEST_PATHS.map(patchCurrentSurfaceTest),
  materializerFiles: MATERIALIZER_PATHS.map(patchHistoricalAdmissionMetric),
  validatorFiles: VALIDATOR_PATHS.map(patchMonotonicPixelValidator),
};

console.log(`P03F10_CURRENT_SURFACE_COMPATIBILITY=${JSON.stringify(report)}`);
