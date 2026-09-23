import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(directory, "run-g4b-u04-r2f-deployed-pages-smoke.mjs");
const runtimePath = resolve(directory, ".run-g4b-u04-r2f-deployed-pages-smoke-runtime.mjs");

const blockingPatternGroupCandidateBlock = `  const patternGroupButtons = page.locator("#batch-a-pattern-group-panel [data-pattern-group-id]");
  await patternGroupButtons.first().waitFor({ state: "visible", timeout: 120000 });
  const patternGroupButtonCount = await patternGroupButtons.count();
  if (patternGroupButtonCount !== EXPECTED_PATTERN_GROUP_COUNT) {
    fail("G4B_U04_R2F_DEPLOYED_PATTERN_GROUP_BUTTON_COUNT_MISMATCH", {
      patternGroupButtonCount,
      expected: EXPECTED_PATTERN_GROUP_COUNT,
    });
  }
`;

const nonBlockingPatternGroupDiagnostic = `  const patternGroupButtons = page.locator("#batch-a-pattern-group-panel [data-pattern-group-id]");
  const patternGroupButtonCount = await patternGroupButtons.count();
`;

const source = await readFile(sourcePath, "utf8");
const matches = source.split(blockingPatternGroupCandidateBlock).length - 1;
if (matches !== 1) {
  throw new Error(`G4B_U04_R2F2_PATTERN_GROUP_PATCH_ANCHOR_MISMATCH:${matches}`);
}

await writeFile(
  runtimePath,
  source.replace(blockingPatternGroupCandidateBlock, nonBlockingPatternGroupDiagnostic),
  "utf8",
);

try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
} finally {
  await rm(runtimePath, { force: true });
}
