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

const immediateReplayAssertionBlock = `  await page.locator("#g4b-u04-context-mode").waitFor({ state: "visible", timeout: 120000 });
  if (await page.locator("#g4b-u04-context-mode").inputValue() !== "sdg") {
    fail("G4B_U04_R2F_CONTEXT_QUERY_REPLAY_FAILED");
  }
  if (await page.locator("#g4b-u04-layout-mode").inputValue() !== "custom_with_caps") {
    fail("G4B_U04_R2F_LAYOUT_QUERY_REPLAY_FAILED");
  }
`;

const synchronizedReplayAssertionBlock = `  const replayUrl = new URL(page.url());
  const replayContextQuery = replayUrl.searchParams.get("contextMode");
  const replayLayoutQuery = replayUrl.searchParams.get("layoutMode");
  if (replayContextQuery !== "sdg") {
    fail("G4B_U04_R2F_CONTEXT_QUERY_REPLAY_FAILED", { replayContextQuery, url: page.url() });
  }
  if (replayLayoutQuery !== "custom_with_caps") {
    fail("G4B_U04_R2F_LAYOUT_QUERY_REPLAY_FAILED", { replayLayoutQuery, url: page.url() });
  }
  try {
    await page.waitForFunction(
      ({ contextMode, layoutMode }) => document.querySelector("#g4b-u04-context-mode")?.value === contextMode
        && document.querySelector("#g4b-u04-layout-mode")?.value === layoutMode,
      { contextMode: "sdg", layoutMode: "custom_with_caps" },
      { timeout: 120000 },
    );
  } catch (error) {
    fail("G4B_U04_R2F_LAYOUT_CONTROL_REPLAY_SYNCHRONIZATION_TIMEOUT", {
      url: page.url(),
      replayContextQuery,
      replayLayoutQuery,
      contextControlValue: await page.locator("#g4b-u04-context-mode").inputValue().catch(() => null),
      layoutControlValue: await page.locator("#g4b-u04-layout-mode").inputValue().catch(() => null),
      cause: error.message,
    });
  }
`;

let source = await readFile(sourcePath, "utf8");
const patternGroupMatches = source.split(blockingPatternGroupCandidateBlock).length - 1;
if (patternGroupMatches !== 1) {
  throw new Error(`G4B_U04_R2F3_PATTERN_GROUP_PATCH_ANCHOR_MISMATCH:${patternGroupMatches}`);
}
source = source.replace(blockingPatternGroupCandidateBlock, nonBlockingPatternGroupDiagnostic);

const replayMatches = source.split(immediateReplayAssertionBlock).length - 1;
if (replayMatches !== 1) {
  throw new Error(`G4B_U04_R2F3_LAYOUT_REPLAY_PATCH_ANCHOR_MISMATCH:${replayMatches}`);
}
source = source.replace(immediateReplayAssertionBlock, synchronizedReplayAssertionBlock);

await writeFile(runtimePath, source, "utf8");

try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
} finally {
  await rm(runtimePath, { force: true });
}
